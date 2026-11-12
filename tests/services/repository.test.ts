import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import {
  demoServices,
  demoAthlete,
  demoPartner,
} from "../../src/lib/services/fixtures.ts";
import {
  mutateServiceTenant,
  readServiceTenant,
  resolveServiceActor,
  type ServiceSql,
} from "../../src/lib/services/repository.ts";
const now = "2026-11-12T05:00:00.000Z";
async function setup() {
  const pg = new PGlite();
  await pg.waitReady;
  await pg.exec(
    await readFile(
      new URL("../../migrations/0002_sportix_services.sql", import.meta.url),
      "utf8",
    ),
  );
  const sql: ServiceSql = {
    query: async <T>(q: string, p?: unknown[]) =>
      (await pg.query<T>(q, p)).rows,
  };
  const state = demoServices(now);
  state.mode = "operational";
  state.offers[0].remaining = state.offers[0].capacity = 1;
  await sql.query(
    "INSERT INTO sportix_service_workspaces (tenant_id, state) VALUES ($1, $2)",
    [demoPartner.tenant, JSON.stringify(state)],
  );
  return { pg, sql };
}
test("SQL CAS: 30 concurrent athletes compete for one remaining place; one winner", async () => {
  const { pg, sql } = await setup();
  try {
    const results = await Promise.allSettled(
      Array.from({ length: 30 }, (_, i) =>
        mutateServiceTenant(
          sql,
          demoPartner.tenant!,
          { ...demoAthlete, id: `athlete-${i}` },
          `parallel-${i}`,
          {
            op: "request.create",
            id: `request-${i}`,
            offerId: "demo-club",
            offerVersion: 1,
            quantity: 1,
            consent: true,
          },
          now,
        ),
      ),
    );
    assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
    const view = await readServiceTenant(
      sql,
      demoPartner.tenant!,
      demoPartner,
      now,
    );
    assert.equal(view.requests.length, 1);
    assert.equal(view.offers[0].remaining, 0);
    assert.equal(view.audit.length, 1);
  } finally {
    await pg.close();
  }
});
test("SQL receipts persist on reload and prevent repeat reservation/cancellation", async () => {
  const { pg, sql } = await setup();
  try {
    const command = {
      op: "request.create",
      id: "replay-order",
      offerId: "demo-club",
      offerVersion: 1,
      quantity: 1,
      consent: true,
    };
    await mutateServiceTenant(
      sql,
      demoPartner.tenant!,
      demoAthlete,
      "same-request",
      command,
      now,
    );
    await mutateServiceTenant(
      sql,
      demoPartner.tenant!,
      demoAthlete,
      "same-request",
      command,
      now,
    );
    await mutateServiceTenant(
      sql,
      demoPartner.tenant!,
      demoAthlete,
      "same-cancel",
      { op: "request.cancel", id: "replay-order", version: 1 },
      now,
    );
    await mutateServiceTenant(
      sql,
      demoPartner.tenant!,
      demoAthlete,
      "same-cancel",
      { op: "request.cancel", id: "replay-order", version: 1 },
      now,
    );
    const view = await readServiceTenant(
      sql,
      demoPartner.tenant!,
      demoAthlete,
      now,
    );
    assert.equal(view.requests.length, 1);
    assert.equal(view.requests[0].status, "CANCELLED");
    assert.equal(view.offers[0].remaining, 1);
    const restored = new PGlite({ loadDataDir: await pg.dumpDataDir() });
    await restored.waitReady;
    const rows = await restored.query<{ revision: number }>(
      "SELECT revision FROM sportix_service_workspaces",
    );
    assert.equal(rows.rows[0].revision, 2);
    await restored.close();
  } finally {
    await pg.close();
  }
});
test("server account and membership resolution rejects unprovisioned, inactive and forged roles", async () => {
  const { pg, sql } = await setup();
  try {
    await assert.rejects(
      resolveServiceActor(sql, "unknown", null, "athlete"),
      /ACCOUNT_NOT_READY/,
    );
    await sql.query(
      "INSERT INTO sportix_service_accounts(user_id, adult) VALUES ('user-a', true), ('minor', false)",
    );
    await assert.rejects(
      resolveServiceActor(sql, "user-a", demoPartner.tenant, "partner"),
      /FORBIDDEN/,
    );
    await sql.query(
      "INSERT INTO sportix_service_memberships(user_id, tenant_id, role) VALUES ('user-a', $1, 'partner')",
      [demoPartner.tenant],
    );
    const partner = await resolveServiceActor(
      sql,
      "user-a",
      demoPartner.tenant,
      "partner",
    );
    assert.equal(partner.tenant, demoPartner.tenant);
    await assert.rejects(
      resolveServiceActor(sql, "user-a", "foreign", "partner"),
      /FORBIDDEN/,
    );
    await assert.rejects(
      resolveServiceActor(sql, "user-a", demoPartner.tenant, "reviewer"),
      /FORBIDDEN/,
    );
    const minor = await resolveServiceActor(sql, "minor", null, "athlete");
    assert.equal(minor.adult, false);
    await sql.query(
      "UPDATE sportix_service_memberships SET active = false WHERE user_id = 'user-a'",
    );
    await assert.rejects(
      resolveServiceActor(sql, "user-a", demoPartner.tenant, "partner"),
      /FORBIDDEN/,
    );
    await sql.query(
      "UPDATE sportix_service_accounts SET active = false WHERE user_id = 'user-a'",
    );
    await assert.rejects(
      resolveServiceActor(sql, "user-a", null, "athlete"),
      /ACCOUNT_NOT_READY/,
    );
  } finally {
    await pg.close();
  }
});
test("SQL operational workspace rejects sandbox data and foreign-tenant mutation", async () => {
  const { pg, sql } = await setup();
  try {
    await assert.rejects(
      sql.query(
        "INSERT INTO sportix_service_workspaces(tenant_id,state) VALUES ($1,$2)",
        ["bad", JSON.stringify(demoServices(now))],
      ),
    );
    await assert.rejects(
      mutateServiceTenant(
        sql,
        demoPartner.tenant!,
        { ...demoPartner, tenant: "foreign" },
        "forged-command",
        { op: "offer.pause", id: "demo-club", version: 1 },
        now,
      ),
      /FORBIDDEN/,
    );
  } finally {
    await pg.close();
  }
});

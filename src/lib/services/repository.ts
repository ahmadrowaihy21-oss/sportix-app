import {
  assertRule,
  executeService,
  serviceView,
  type Actor,
  type ServiceState,
} from "./model.ts";
export interface ServiceSql {
  query<T = Record<string, unknown>>(
    query: string,
    params?: unknown[],
  ): Promise<T[]>;
}
/** Internal server repository. Actor is resolved from a verified session, never request JSON. */
export async function resolveServiceActor(
  sql: ServiceSql,
  userId: string,
  tenant: string | null,
  role: Actor["role"],
): Promise<Actor> {
  const accounts = await sql.query<{ adult: boolean }>(
    "SELECT adult FROM sportix_service_accounts WHERE user_id = $1 AND active = true",
    [userId],
  );
  assertRule(accounts.length === 1, "ACCOUNT_NOT_READY");
  if (role !== "athlete") {
    const memberships = await sql.query(
      "SELECT 1 FROM sportix_service_memberships WHERE user_id = $1 AND tenant_id = $2 AND role = $3 AND active = true",
      [userId, tenant, role],
    );
    assertRule(memberships.length === 1, "FORBIDDEN");
  }
  return {
    id: userId,
    role,
    tenant: role === "athlete" ? null : tenant,
    adult: accounts[0].adult,
  };
}
export async function readServiceTenant(
  sql: ServiceSql,
  tenant: string,
  actor: Actor,
  now: string,
) {
  const rows = await sql.query<{ state: ServiceState }>(
    "SELECT state FROM sportix_service_workspaces WHERE tenant_id = $1",
    [tenant],
  );
  assertRule(rows.length === 1, "PARTNER_NOT_FOUND");
  return serviceView(rows[0].state, actor, now);
}
/** Optimistic SQL CAS commits state, inventory, receipts and audit atomically.
 * Commands are revalidated after contention; no check-then-write stock race. */
export async function mutateServiceTenant(
  sql: ServiceSql,
  tenant: string,
  actor: Actor,
  key: string,
  command: unknown,
  now: string,
) {
  for (let attempt = 0; attempt < 12; attempt++) {
    const rows = await sql.query<{ state: ServiceState; revision: number }>(
      "SELECT state, revision FROM sportix_service_workspaces WHERE tenant_id = $1",
      [tenant],
    );
    assertRule(rows.length === 1, "PARTNER_NOT_FOUND");
    const { state, revision } = rows[0];
    assertRule(state.mode === "operational", "OPERATIONAL_DATA_REQUIRED");
    assertRule(
      state.offers.every((o) => o.tenant === tenant) &&
        state.requests.every((r) => r.tenant === tenant),
      "TENANT_DATA_MISMATCH",
    );
    if (actor.role !== "athlete")
      assertRule(actor.tenant === tenant, "FORBIDDEN");
    const next = executeService(state, actor, key, command, now);
    if (next === state) return serviceView(next, actor, now);
    const saved = await sql.query(
      "UPDATE sportix_service_workspaces SET state = $1::jsonb, revision = $2 WHERE tenant_id = $3 AND revision = $4 RETURNING revision",
      [JSON.stringify(next), next.revision, tenant, revision],
    );
    if (saved.length === 1) return serviceView(next, actor, now);
  }
  throw new Error("CONCURRENT_UPDATE_RETRY");
}

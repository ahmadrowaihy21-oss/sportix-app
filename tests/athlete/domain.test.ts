import test from "node:test";
import assert from "node:assert/strict";
import {
  createSyntheticAthlete,
  executeAthlete,
  visibleSyntheticPosts,
  requireOperationalBackend,
} from "../../src/lib/athlete/engine.ts";
import { partnerFixtures } from "../../src/lib/athlete/fixtures.ts";
import {
  createCommercePreview,
  previewCommerceIntent,
  mapPartnerListing,
  rejectSandboxSettlement,
} from "../../src/lib/athlete/partners.ts";
import type { AthleteState } from "../../src/lib/athlete/contracts.ts";
const now = "2026-11-11T03:00:00.000Z";
const owner = "spx_test_athlete_001";
const metrics = { durationSec: 1200, distanceKm: 3, steps: 3500 };
function run(s: AthleteState, cmd: unknown, key = `command-${s.revision + 1}`) {
  return executeAthlete(s, owner, key, cmd, now);
}
function created(kind = "running", minor = false) {
  return run(createSyntheticAthlete(owner, minor), {
    op: "activity.create",
    id: "activity-1",
    kind,
  });
}
function submitted(kind = "running") {
  return run(created(kind), {
    op: "activity.submit",
    id: "activity-1",
    version: 1,
    metrics,
    evidenceRef: "synthetic-evidence-1",
  });
}
function completed(outcome = "pass", kind = "running") {
  return run(submitted(kind), {
    op: "activity.simulate",
    id: "activity-1",
    version: 2,
    outcome,
  });
}
function share(s: AthleteState, audience = "PUBLIC", shareMetrics = false) {
  return run(s, {
    op: "consent.set",
    id: "activity-1",
    version: s.activities[0]!.version,
    audience,
    shareMetrics,
  });
}

test("default activity is private and has canonical owner", () => {
  const a = created().activities[0]!;
  assert.equal(a.sportixUserId, owner);
  assert.equal(a.consent.audience, "PRIVATE");
});
test("creates private SPORT ID test projection without points or verification", () => {
  const s = completed();
  assert.equal(s.sportId.length, 1);
  assert.equal(s.sportId[0]!.verified, false);
  assert.equal(s.sportId[0]!.rewardsGranted, 0);
  assert.equal(s.posts.length, 0);
});
test("public summary strips internal identity, media, health, location and metrics by default", () => {
  const s = share(completed());
  const p = visibleSyntheticPosts(s, null)[0]!;
  assert.equal(p.verified, false);
  for (const field of [
    "sportixUserId",
    "metrics",
    "media",
    "evidenceRef",
    "health",
    "location",
  ])
    assert.equal(field in p, false);
});
test("metric sharing is separate explicit consent", () => {
  const s = share(completed(), "PUBLIC", true);
  assert.deepEqual(visibleSyntheticPosts(s, null)[0]!.metrics, metrics);
});
test("friends audience rejects outsiders and anonymous viewers", () => {
  const s = share(completed(), "FRIENDS");
  assert.equal(visibleSyntheticPosts(s, null).length, 0);
  assert.equal(
    visibleSyntheticPosts(s, "spx_test_stranger", ["spx_test_friend"]).length,
    0,
  );
  assert.equal(
    visibleSyntheticPosts(s, "spx_test_friend", ["spx_test_friend"]).length,
    1,
  );
  assert.equal(visibleSyntheticPosts(s, owner).length, 1);
});
test("revocation removes post but retains private sport record", () => {
  let s = share(completed());
  s = share(s, "PRIVATE");
  assert.equal(s.posts.length, 0);
  assert.equal(s.sportId.length, 1);
});
test("metric withdrawal updates existing post without a second post", () => {
  let s = share(completed(), "PUBLIC", true);
  s = share(s, "PUBLIC", false);
  assert.equal(s.posts.length, 1);
  assert.equal(s.posts[0]!.metrics, undefined);
  assert.equal(s.posts[0]!.consentVersion, 3);
});
for (const outcome of ["review", "insufficient"])
  test(`${outcome} is recorded privately and never published`, () => {
    const s = share(completed(outcome));
    assert.equal(s.posts.length, 0);
    assert.equal(s.sportId.length, 1);
    assert.equal(s.sportId[0]!.verified, false);
  });
test("cycling pass remains review-required", () =>
  assert.equal(
    completed("pass", "cycling").activities[0]!.status,
    "REVIEW_REQUIRED",
  ));
test("replay same key+payload does not add records, audit or revision", () => {
  const s = submitted();
  const cmd = {
    op: "activity.simulate",
    id: "activity-1",
    version: 2,
    outcome: "pass",
  };
  const next = run(s, cmd, "same-key-1");
  assert.equal(run(next, cmd, "same-key-1"), next);
});
test("reuse key with different payload is rejected atomically", () => {
  const s = created();
  const before = JSON.stringify(s);
  assert.throws(
    () =>
      run(
        s,
        { op: "activity.create", id: "other", kind: "running" },
        "command-1",
      ),
    /IDEMPOTENCY_CONFLICT/,
  );
  assert.equal(JSON.stringify(s), before);
});
test("stale entity version rejected", () =>
  assert.throws(
    () =>
      run(submitted(), {
        op: "activity.simulate",
        id: "activity-1",
        version: 1,
        outcome: "pass",
      }),
    /VERSION_CONFLICT/,
  ));
test("different actor cannot act on owner data", () =>
  assert.throws(
    () =>
      executeAthlete(
        created(),
        "spx_test_foreign",
        "foreign-1",
        {
          op: "consent.set",
          id: "activity-1",
          version: 1,
          audience: "PUBLIC",
          shareMetrics: true,
        },
        now,
      ),
    /OWNER_MISMATCH/,
  ));
test("real, dev and anonymous identities rejected by sandbox", () => {
  for (const id of ["", "dev-user", "yousef", "real@example.com", "spx_u_0000"])
    assert.throws(() => createSyntheticAthlete(id));
});
test("minor public/friends sharing blocked pending guardian policy", () => {
  for (const a of ["PUBLIC", "FRIENDS"])
    assert.throws(
      () => share(created("running", true), a),
      /GUARDIAN_POLICY_REQUIRED/,
    );
});
test("cannot simulate before submission", () =>
  assert.throws(
    () =>
      run(created(), {
        op: "activity.simulate",
        id: "activity-1",
        version: 1,
        outcome: "pass",
      }),
    /INVALID_TRANSITION/,
  ));
test("cannot forge production verified command or state field", () => {
  for (const cmd of [
    { op: "activity.verify", id: "activity-1", version: 2, outcome: "pass" },
    {
      op: "activity.simulate",
      id: "activity-1",
      version: 2,
      outcome: "pass",
      verified: true,
    },
  ])
    assert.throws(() => run(submitted(), cmd));
});
test("real media URLs cannot enter evidence contract", () =>
  assert.throws(() =>
    run(created(), {
      op: "activity.submit",
      id: "activity-1",
      version: 1,
      metrics,
      evidenceRef: "https://example.com/private.jpg",
    }),
  ));
for (const value of [-1, NaN, Infinity, 1e10])
  test(`invalid metric ${value} rejected without commit`, () => {
    const s = created();
    assert.throws(() =>
      run(s, {
        op: "activity.submit",
        id: "activity-1",
        version: 1,
        metrics: { ...metrics, distanceKm: value },
        evidenceRef: "synthetic-evidence-1",
      }),
    );
    assert.equal(s.revision, 1);
  });
test("empty activity rejected", () =>
  assert.throws(
    () =>
      run(created(), {
        op: "activity.submit",
        id: "activity-1",
        version: 1,
        metrics: { ...metrics, distanceKm: 0 },
        evidenceRef: "synthetic-evidence-1",
      }),
    /EMPTY_ACTIVITY/,
  ));
test("retry insufficient evidence updates one sport record", () => {
  let s = completed("insufficient");
  s = run(s, {
    op: "activity.submit",
    id: "activity-1",
    version: 3,
    metrics,
    evidenceRef: "synthetic-evidence-2",
  });
  s = run(s, {
    op: "activity.simulate",
    id: "activity-1",
    version: 4,
    outcome: "pass",
  });
  assert.equal(s.sportId.length, 1);
});
test("double completion with a new key cannot create extra record", () =>
  assert.throws(
    () =>
      run(completed(), {
        op: "activity.simulate",
        id: "activity-1",
        version: 3,
        outcome: "pass",
      }),
    /INVALID_TRANSITION/,
  ));
test("output mutations do not mutate source aggregate", () => {
  const s = share(completed(), "PUBLIC", true);
  const p = visibleSyntheticPosts(s, null);
  p[0]!.metrics!.distanceKm = 900;
  assert.equal(s.posts[0]!.metrics!.distanceKm, 3);
});
test("operational boundary always fails closed", () =>
  assert.throws(
    () => requireOperationalBackend(),
    /OPERATIONAL_BACKEND_REQUIRED/,
  ));
for (const raw of partnerFixtures)
  test(`partner ${raw.kind} maps minor units and version without purchase entitlement`, () => {
    const p = mapPartnerListing(raw);
    assert.equal(p.priceMinor, raw.priceMinor);
    assert.equal(p.version, raw.version);
    assert.equal(p.purchasable, false);
  });
test("draft and paused listings excluded", () => {
  for (const status of ["DRAFT", "PAUSED"])
    assert.throws(
      () => mapPartnerListing({ ...partnerFixtures[0], status }),
      /LISTING_NOT_PUBLISHED/,
    );
});
test("self-reviewed listing rejected", () =>
  assert.throws(
    () =>
      mapPartnerListing({ ...partnerFixtures[0], reviewedBy: "demo-partner" }),
    /APPROVAL_REQUIRED/,
  ));
test("module/kind mismatch rejected", () =>
  assert.throws(
    () => mapPartnerListing({ ...partnerFixtures[0], module: "COUPONS" }),
    /MODULE_KIND_MISMATCH/,
  ));
test("all commerce kinds end pending with no rewards/payment/coupon/points debit", () => {
  let s = createCommercePreview();
  for (const raw of partnerFixtures)
    s = previewCommerceIntent(s, owner, `preview-${raw.id}`, raw, 1, 200);
  for (const i of s.intents) {
    assert.equal(i.state, "AWAITING_OPERATIONAL_BACKEND");
    assert.equal(i.pointsDebited, 0);
    assert.equal(i.rewardsGranted, 0);
    assert.equal(i.paymentCaptured, false);
    assert.equal(i.couponIssued, false);
  }
});
test("commerce replay safe, changed payload conflict", () => {
  const s = previewCommerceIntent(
    createCommercePreview(),
    owner,
    "preview-1",
    partnerFixtures[0],
    1,
  );
  assert.equal(
    previewCommerceIntent(s, owner, "preview-1", partnerFixtures[0], 1),
    s,
  );
  assert.throws(
    () => previewCommerceIntent(s, owner, "preview-1", partnerFixtures[0], 2),
    /IDEMPOTENCY_CONFLICT/,
  );
});
for (const n of [0, -1, 1.5, NaN, 21])
  test(`invalid commerce quantity ${n} blocked`, () =>
    assert.throws(
      () =>
        previewCommerceIntent(
          createCommercePreview(),
          owner,
          "preview-1",
          partnerFixtures[0],
          n,
        ),
      /INVALID_QUANTITY/,
    ));
test("preview beyond stock blocked without reserving live stock", () =>
  assert.throws(
    () =>
      previewCommerceIntent(
        createCommercePreview(),
        owner,
        "preview-1",
        partnerFixtures[0],
        3,
      ),
    /PREVIEW_OUT_OF_STOCK/,
  ));
test("negative points cannot credit balance", () =>
  assert.throws(
    () =>
      previewCommerceIntent(
        createCommercePreview(),
        owner,
        "preview-1",
        partnerFixtures[0],
        1,
        -100,
      ),
    /INVALID_POINTS/,
  ));
test("sandbox confirmed/captured receipts never settle athlete commerce", () => {
  for (const receipt of [
    { state: "CONFIRMED", payment: "CAPTURED", synthetic: true },
    { state: "CONFIRMED", payment: "CAPTURED", synthetic: false },
    null,
  ])
    assert.throws(
      () => rejectSandboxSettlement(receipt),
      /OPERATIONAL_BACKEND_REQUIRED/,
    );
});
test("prototype-like idempotency keys replay safely", () => {
  const cmd = { op: "activity.create", id: "activity-safe", kind: "running" };
  const s = run(createSyntheticAthlete(), cmd, "__proto__");
  assert.equal(run(s, cmd, "__proto__"), s);
});
test("commerce actor cannot access another owner aggregate", () =>
  assert.throws(
    () =>
      previewCommerceIntent(
        createCommercePreview(),
        "spx_test_foreign",
        "preview-other",
        partnerFixtures[0],
        1,
      ),
    /OWNER_MISMATCH/,
  ));
import { operationalIdentitySchema } from "../../src/lib/athlete/contracts.ts";
test("operational identity contract accepts opaque IDs and excludes contact fields", () => {
  const identity = {
    schemaVersion: "sportix.identity.v1",
    sportixUserId: "spx_u_00000000-0000-4000-8000-000000000001",
    publicProfileId: "00000000-0000-4000-8000-000000000002",
    provenance: "SERVER_AUTHENTICATED",
    accountState: "ACTIVE",
  };
  assert.equal(
    operationalIdentitySchema.parse(identity).sportixUserId,
    identity.sportixUserId,
  );
  assert.throws(() =>
    operationalIdentitySchema.parse({
      ...identity,
      email: "synthetic@example.test",
    }),
  );
});
test("synthetic identity cannot parse as operational identity", () =>
  assert.throws(() =>
    operationalIdentitySchema.parse(createSyntheticAthlete().identity),
  ));

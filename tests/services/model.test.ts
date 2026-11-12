import test from "node:test";
import assert from "node:assert/strict";
import {
  demoServices,
  demoAthlete as athlete,
  demoPartner as partner,
  demoReviewer as reviewer,
} from "../../src/lib/services/fixtures.ts";
import {
  executeService,
  kinds,
  serviceView,
  serviceCommand,
  type ServiceState,
  type ServiceCommand,
  type Actor,
} from "../../src/lib/services/model.ts";
import {
  newJournal,
  replayJournal,
  appendJournal,
} from "../../src/lib/services/sandbox.ts";
const now = "2026-11-12T05:00:00.000Z";
const later = "2026-11-12T05:16:00.000Z";
let sequence = 0;
const apply = (
  s: ServiceState,
  a: Actor,
  c: ServiceCommand,
  time = now,
  key = `test-key-${++sequence}`,
) => executeService(s, a, key, c, time);
const request = (
  s: ServiceState,
  kind = "CLUB",
  who = athlete,
  key = "request-one",
) =>
  apply(s, who, {
    op: "request.create",
    id: key,
    offerId: `demo-${kind.toLowerCase()}`,
    offerVersion: 1,
    quantity: 1,
    consent: true,
  });
for (const kind of kinds)
  test(`${kind}: athlete request → partner accept → complete → athlete rating`, () => {
    let s = request(demoServices(now), kind);
    s = apply(s, partner, {
      op: "request.accept",
      id: "request-one",
      version: 1,
    });
    s = apply(s, partner, {
      op: "request.complete",
      id: "request-one",
      version: 2,
    });
    assert.equal(s.requests[0].status, "COMPLETED");
    assert.equal(s.requests[0].paymentCaptured, false);
    assert.equal(s.requests[0].pointsDebited, 0);
    s = apply(s, athlete, {
      op: "request.rate",
      id: "request-one",
      version: 3,
      rating: 4,
    });
    assert.equal(s.requests[0].rating, 4);
    assert.throws(
      () =>
        apply(s, athlete, {
          op: "request.rate",
          id: "request-one",
          version: 4,
          rating: 5,
        }),
      /RATING_NOT_ALLOWED/,
    );
  });
test("publication requires a different reviewer and owned tenant", () => {
  let s = demoServices(now);
  s = apply(s, partner, {
    op: "offer.create",
    offer: {
      id: "new-club",
      kind: "CLUB",
      title: "New club",
      description: "A synthetic club",
      city: "Jeddah",
      priceMinor: 0,
      capacity: 2,
      startsAt: null,
      durationDays: 30,
    },
  });
  assert.throws(
    () =>
      apply(s, partner, { op: "offer.publish", id: "new-club", version: 1 }),
    /APPROVAL_REQUIRED/,
  );
  assert.equal(
    serviceView(s, athlete, now).offers.some((o) => o.id === "new-club"),
    false,
  );
  s = apply(s, partner, { op: "offer.submit", id: "new-club", version: 1 });
  assert.throws(
    () =>
      apply(
        s,
        { ...reviewer, id: partner.id },
        { op: "offer.approve", id: "new-club", version: 2 },
      ),
    /INDEPENDENT_REVIEW_REQUIRED/,
  );
  assert.throws(
    () =>
      apply(
        s,
        { ...reviewer, tenant: "foreign" },
        { op: "offer.approve", id: "new-club", version: 2 },
      ),
    /INDEPENDENT_REVIEW_REQUIRED/,
  );
  s = apply(s, reviewer, { op: "offer.approve", id: "new-club", version: 2 });
  s = apply(s, partner, { op: "offer.publish", id: "new-club", version: 3 });
  assert.equal(
    serviceView(s, athlete, now).offers.some((o) => o.id === "new-club"),
    true,
  );
});
test("capacity is bounded and independent of duplicate retries", () => {
  let s = demoServices(now);
  s.offers[0].remaining = s.offers[0].capacity = 1;
  const c: ServiceCommand = {
    op: "request.create",
    id: "capacity-one",
    offerId: "demo-club",
    offerVersion: 1,
    quantity: 1,
    consent: true,
  };
  s = apply(s, athlete, c, now, "same-command");
  const again = apply(s, athlete, c, now, "same-command");
  assert.equal(again, s);
  assert.equal(s.requests.length, 1);
  assert.equal(s.offers[0].remaining, 0);
  assert.throws(
    () => request(s, "CLUB", { ...athlete, id: "another" }, "other-request"),
    /CAPACITY_EXCEEDED/,
  );
  assert.throws(
    () => apply(s, athlete, { ...c, quantity: 2 }, now, "same-command"),
    /IDEMPOTENCY_CONFLICT/,
  );
});
test("cancellation releases once; rejection and repeated cancellation cannot double release", () => {
  let s = request(demoServices(now));
  s = apply(s, athlete, {
    op: "request.cancel",
    id: "request-one",
    version: 1,
  });
  assert.equal(s.offers[0].remaining, 3);
  assert.throws(
    () =>
      apply(s, athlete, {
        op: "request.cancel",
        id: "request-one",
        version: 2,
      }),
    /INVALID_TRANSITION/,
  );
  assert.throws(
    () =>
      apply(s, partner, {
        op: "request.reject",
        id: "request-one",
        version: 2,
      }),
    /INVALID_TRANSITION/,
  );
});
test("expired holds release capacity and cannot be accepted", () => {
  let s = request(demoServices(now));
  assert.equal(serviceView(s, athlete, later).requests[0].status, "EXPIRED");
  assert.throws(
    () =>
      apply(
        s,
        partner,
        { op: "request.accept", id: "request-one", version: 1 },
        later,
      ),
    /REQUEST_EXPIRED/,
  );
  s = apply(
    s,
    { ...athlete, id: "another" },
    {
      op: "request.create",
      id: "after-expiry",
      offerId: "demo-club",
      offerVersion: 1,
      quantity: 1,
      consent: true,
    },
    later,
  );
  assert.equal(s.requests[0].status, "EXPIRED");
  assert.equal(s.offers[0].remaining, 2);
});
test("another athlete and foreign partner cannot read or modify a private request", () => {
  const s = request(demoServices(now));
  assert.equal(
    serviceView(s, { ...athlete, id: "intruder" }, now).requests.length,
    0,
  );
  assert.equal(
    serviceView(s, { ...partner, tenant: "foreign" }, now).requests.length,
    0,
  );
  assert.throws(
    () =>
      apply(
        s,
        { ...athlete, id: "intruder" },
        { op: "request.cancel", id: "request-one", version: 1 },
      ),
    /FORBIDDEN/,
  );
  assert.throws(
    () =>
      apply(
        s,
        { ...partner, tenant: "foreign" },
        { op: "request.accept", id: "request-one", version: 1 },
      ),
    /FORBIDDEN/,
  );
  assert.throws(
    () =>
      apply(s, athlete, {
        op: "request.accept",
        id: "request-one",
        version: 1,
      }),
    /FORBIDDEN/,
  );
  const view = serviceView(s, athlete, now);
  assert.equal("receipts" in view, false);
  assert.equal("reviewedBy" in view.offers[0], false);
  assert.equal("actorId" in view.audit[0], false);
});
test("consent, minor eligibility, single participant and payload validation", () => {
  const s = demoServices(now);
  assert.throws(
    () => request(s, "CLUB", { ...athlete, adult: false }),
    /GUARDIAN_POLICY_REQUIRED/,
  );
  assert.equal(
    serviceCommand.safeParse({
      op: "request.create",
      id: "r",
      offerId: "demo-club",
      offerVersion: 1,
      quantity: 1,
      consent: false,
    }).success,
    false,
  );
  for (const quantity of [-1, 0, NaN, 1.1, 11])
    assert.equal(
      serviceCommand.safeParse({
        op: "request.create",
        id: "r",
        offerId: "demo-club",
        offerVersion: 1,
        quantity,
        consent: true,
      }).success,
      false,
    );
  assert.throws(
    () =>
      apply(s, athlete, {
        op: "request.create",
        id: "r",
        offerId: "demo-club",
        offerVersion: 1,
        quantity: 2,
        consent: true,
      }),
    /SINGLE_PARTICIPANT_ONLY/,
  );
  assert.equal(
    serviceCommand.safeParse({
      op: "request.cancel",
      id: "r",
      version: 1,
      athleteId: "forged",
    }).success,
    false,
  );
});
test("paused and stale offers cannot receive requests", () => {
  let s = demoServices(now);
  s = apply(s, partner, { op: "offer.pause", id: "demo-club", version: 1 });
  assert.throws(() => request(s), /OFFER_UNAVAILABLE/);
  s = apply(s, partner, { op: "offer.publish", id: "demo-club", version: 2 });
  assert.throws(() => request(s), /VERSION_CONFLICT/);
});
test("duplicate active request and completion before acceptance are rejected", () => {
  const s = request(demoServices(now));
  assert.throws(
    () => request(s, "CLUB", athlete, "other-id"),
    /DUPLICATE_ACTIVE_REQUEST/,
  );
  assert.throws(
    () =>
      apply(s, partner, {
        op: "request.complete",
        id: "request-one",
        version: 1,
      }),
    /INVALID_TRANSITION/,
  );
  assert.throws(
    () =>
      apply(s, athlete, {
        op: "request.rate",
        id: "request-one",
        version: 1,
        rating: 5,
      }),
    /RATING_NOT_ALLOWED/,
  );
});
test("coupon redemption is once, tenant-scoped and expires", () => {
  let s = request(demoServices(now), "COUPON");
  s = apply(s, partner, {
    op: "request.accept",
    id: "request-one",
    version: 1,
  });
  s = apply(s, partner, {
    op: "request.complete",
    id: "request-one",
    version: 2,
  });
  assert.throws(
    () =>
      apply(
        s,
        partner,
        { op: "request.redeem", id: "request-one", version: 3 },
        "2027-01-01T00:00:00.000Z",
      ),
    /ENTITLEMENT_EXPIRED/,
  );
  assert.throws(
    () =>
      apply(s, athlete, {
        op: "request.redeem",
        id: "request-one",
        version: 3,
      }),
    /FORBIDDEN/,
  );
  s = apply(s, partner, {
    op: "request.redeem",
    id: "request-one",
    version: 3,
  });
  assert.equal(s.requests[0].entitlement?.status, "SIMULATED_USED");
  assert.throws(
    () =>
      apply(s, partner, {
        op: "request.redeem",
        id: "request-one",
        version: 4,
      }),
    /NOT_REDEEMABLE/,
  );
});
test("operational mode cannot treat simulation as payment or issue entitlements", () => {
  for (const kind of kinds.filter((k) => k !== "IMPACT")) {
    let s = demoServices(now);
    s.mode = "operational";
    s = request(s, kind);
    s = apply(s, partner, {
      op: "request.accept",
      id: "request-one",
      version: 1,
    });
    assert.throws(
      () =>
        apply(s, partner, {
          op: "request.complete",
          id: "request-one",
          version: 2,
        }),
      /PROVIDER_REQUIRED/,
    );
    assert.equal(s.requests[0].entitlement, null);
  }
  let s = demoServices(now);
  s.mode = "operational";
  s = request(s, "IMPACT");
  s = apply(s, partner, {
    op: "request.accept",
    id: "request-one",
    version: 1,
  });
  s = apply(s, partner, {
    op: "request.complete",
    id: "request-one",
    version: 2,
  });
  assert.equal(s.requests[0].status, "COMPLETED");
});
test("journal survives reload; malformed and unauthorized entries are rejected", () => {
  const first = appendJournal(
    newJournal(now),
    "athlete",
    "saved-command",
    {
      op: "request.create",
      id: "saved-request",
      offerId: "demo-impact",
      offerVersion: 1,
      quantity: 1,
      consent: true,
    },
    now,
  );
  assert.deepEqual(
    replayJournal(JSON.parse(JSON.stringify(first.journal))).state,
    first.state,
  );
  assert.throws(() => replayJournal({ schema: 0 }));
  const bad = structuredClone(first.journal);
  bad.entries[0].role = "partner";
  assert.throws(() => replayJournal(bad), /FORBIDDEN/);
});

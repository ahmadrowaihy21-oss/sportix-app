import test, { beforeEach } from "node:test";
import assert from "node:assert/strict";
import { useGo } from "../../src/lib/go-sportix/store.ts";
import { useSportId } from "../../src/lib/sport-id/store.ts";
import { useSportix } from "../../src/lib/sportix/store.ts";
import { useWeekly } from "../../src/lib/weekly-legends/store.ts";
import { useMarket } from "../../src/lib/marketplace/store.ts";
import { useAthlete } from "../../src/lib/athlete/store.ts";
import { listings } from "../../src/lib/marketplace/mock.ts";
beforeEach(() => useGo.getState().resetDemo());
function go(outcome: "verified" | "review" | "insufficient" = "verified") {
  useGo.getState().chooseActivity("running");
  useGo.getState().startActivity();
  const start = useGo.getState().lastTick;
  for (let i = 1; i <= 10; i++) useGo.getState().tick(start + i * 200);
  useGo.getState().requestFinish();
  useGo.getState().attachMedia(
    new File(["synthetic-test-media"], "synthetic.txt", {
      type: "image/png",
    }),
  );
  useGo.getState().finishAndVerify();
  useGo.getState().completeVerification(outcome);
}
test("actual GO flow writes private SPORT ID test record with canonical owner", () => {
  go();
  assert.equal(useGo.getState().session?.state, "SIMULATED_COMPLETED");
  assert.equal(useSportId.getState().integrationRecords.length, 1);
  assert.equal(
    useSportId.getState().integrationRecords[0]!.sportixUserId,
    useAthlete.getState().data.identity.sportixUserId,
  );
  assert.equal(
    useSportix.getState().posts.filter((p) => p.athleteProjection).length,
    0,
  );
});
test("actual GO flow cannot change weekly ranking, verified metrics, market balance or rewards", () => {
  const weekly = useWeekly.getState().ssp;
  const balance = useMarket.getState().pointsBalance;
  go();
  assert.equal(useWeekly.getState().ssp, weekly);
  assert.equal(useSportId.getState().sspBonus, 0);
  assert.equal(useSportId.getState().extraActivities, 0);
  assert.equal(useSportId.getState().goRecords.length, 0);
  assert.equal(useMarket.getState().pointsBalance, balance);
});
test("public consent creates sanitized post, then private removes it", () => {
  go();
  useGo.getState().setAudience("PUBLIC");
  const p = useSportix.getState().posts.find((p) => p.athleteProjection)!;
  assert.equal(p.verification, "unverified");
  assert.equal(p.media.src, "");
  assert.equal(p.goEvidence, undefined);
  assert.equal(p.performance, undefined);
  useGo.getState().setAudience("ONLY ME");
  assert.equal(
    useSportix.getState().posts.some((p) => p.athleteProjection),
    false,
  );
  assert.equal(useGo.getState().session?.postId, null);
});
test("repeated completion has no side effects", () => {
  go();
  const before = JSON.stringify(useAthlete.getState().data);
  useGo.getState().completeVerification("verified");
  assert.equal(JSON.stringify(useAthlete.getState().data), before);
  assert.equal(useSportId.getState().integrationRecords.length, 1);
});
test("review and insufficient are private regardless of share choice", () => {
  for (const outcome of ["review", "insufficient"] as const) {
    useGo.getState().resetDemo();
    go(outcome);
    useGo.getState().setAudience("PUBLIC");
    assert.equal(
      useSportix.getState().posts.some((p) => p.athleteProjection),
      false,
    );
  }
});
test("new activity resets prior sharing to private", () => {
  go();
  useGo.getState().setAudience("PUBLIC");
  useGo.getState().chooseActivity("walking");
  assert.equal(useGo.getState().audience, "ONLY ME");
  assert.equal(
    useAthlete.getState().data.activities.at(-1)!.consent.audience,
    "PRIVATE",
  );
});
test("missing evidence cannot complete GO", () => {
  useGo.getState().chooseActivity("running");
  useGo.getState().finishAndVerify();
  useGo.getState().completeVerification("verified");
  assert.equal(useSportId.getState().integrationRecords.length, 0);
});
test("reset clears projections without deleting unrelated community seed posts", () => {
  const initial = useSportix.getState().posts.length;
  go();
  useGo.getState().setAudience("PUBLIC");
  useGo.getState().resetDemo();
  assert.equal(useSportix.getState().posts.length, initial);
  assert.equal(useSportId.getState().integrationRecords.length, 0);
});
test("legacy verified record mutator cannot mint SSP", () =>
  assert.throws(
    () => useSportId.getState().recordVerifiedActivity({} as never),
    /OPERATIONAL_BACKEND_REQUIRED/,
  ));
test("checkout simulation success cannot approve purchase or issue coupon", () => {
  const before = {
    orders: useMarket.getState().orders,
    points: useMarket.getState().pointsBalance,
    coupons: useMarket.getState().coupons,
  };
  for (const source of [
    "buy-now",
    "coupon",
    "subscribe",
    "impact",
    "cart",
  ] as const) {
    assert.equal(
      useMarket.getState().checkout({
        source,
        listingId: listings[0]!.id,
        pointsUsed: 0,
        method: "card",
        outcome: "success",
        clientKey: "synthetic-success",
      }),
      null,
    );
  }
  assert.deepEqual(useMarket.getState().orders, before.orders);
  assert.equal(useMarket.getState().pointsBalance, before.points);
  assert.deepEqual(useMarket.getState().coupons, before.coupons);
});
test("coupon redemption remains blocked", () =>
  assert.equal(useMarket.getState().redeemCoupon("fake-coupon"), false));
test("foreign media binding is rejected", () => {
  useGo.getState().chooseActivity("running");
  useGo.getState().startActivity();
  useGo.getState().tick(useGo.getState().lastTick + 200);
  useGo.getState().requestFinish();
  useGo
    .getState()
    .attachMedia(new File(["synthetic"], "test.png", { type: "image/png" }));
  const s = useGo.getState().session!;
  useGo.setState({
    session: { ...s, media: { ...s.media!, user_id: "spx_test_foreign" } },
  });
  useGo.getState().finishAndVerify();
  useGo.getState().completeVerification("verified");
  assert.equal(useSportId.getState().integrationRecords.length, 0);
});
test("terminal activity cannot be submitted again through finish action", () => {
  go();
  useGo.getState().requestFinish();
  useGo.getState().finishAndVerify();
  assert.equal(useGo.getState().session?.state, "SIMULATED_COMPLETED");
});

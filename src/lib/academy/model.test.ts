import { test } from "node:test";
import assert from "node:assert/strict";
import {
  sampleState,
  validateAthlete,
  validateReport,
  approveReport,
  athleteReports,
  parseStoredState,
} from "./model.ts";
test("duplicate shirts and invalid names are rejected", () => {
  const s = sampleState();
  assert.ok(
    validateAthlete(
      { alias: "اختبار", shirt: 10, position: "وسط" },
      s.athletes,
    ),
  );
  assert.ok(
    validateAthlete({ alias: " ", shirt: 20, position: "وسط" }, s.athletes),
  );
  assert.equal(
    validateAthlete(
      { alias: "تجريبي", shirt: 20, position: "وسط" },
      s.athletes,
    ),
    null,
  );
});
test("drafts stay hidden from athlete until reviewed and approved", () => {
  const s = sampleState();
  assert.equal(athleteReports(s, "demo-01").length, 2);
  const next = approveReport(s, "r3", "2026-10-30T10:00:00Z");
  assert.equal(athleteReports(next, "demo-01").length, 3);
  assert.equal(s.reports.find((r) => r.id === "r3")?.status, "draft");
  assert.equal(approveReport(next, "r3", "later"), next);
});
test("low coverage cannot be approved or forged via stored state", () => {
  const s = sampleState();
  assert.throws(() => approveReport(s, "r4", "now"), /95/);
  const forged = structuredClone(s);
  forged.reports[3].status = "approved";
  forged.reports[3].approvedAt = "now";
  assert.equal(parseStoredState(JSON.stringify(forged)), null);
});
test("report validation rejects missing athletes, impossible dates, nonfinite values", () => {
  const s = sampleState(),
    r = s.reports[0];
  assert.ok(validateReport({ ...r, athleteId: "other" }, s.athletes));
  assert.ok(validateReport({ ...r, date: "2026-02-31" }, s.athletes));
  assert.ok(validateReport({ ...r, distanceKm: NaN }, s.athletes));
  assert.ok(validateReport({ ...r, minutes: 0 }, s.athletes));
});
test("stored state handles malformed, version mismatches and duplicate IDs", () => {
  assert.equal(parseStoredState("{"), null);
  assert.equal(parseStoredState('{"version":2}'), null);
  const s = sampleState();
  assert.deepEqual(parseStoredState(JSON.stringify(s)), s);
  s.reports.push(s.reports[0]);
  assert.equal(parseStoredState(JSON.stringify(s)), null);
});

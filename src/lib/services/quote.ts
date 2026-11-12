import { assertRule } from "./model.ts";
// PR #5 sandbox policy only. This is a quote, never a wallet or settlement entry.
export const SANDBOX_POINTS_POLICY = {
  version: "market-sandbox-v1",
  pointMinor: 10,
  coverageBps: 3000,
} as const;
export function previewPointsQuote(
  priceMinor: number,
  points: number,
  balance = 1000,
) {
  for (const value of [priceMinor, points, balance])
    assertRule(Number.isSafeInteger(value) && value >= 0, "INVALID_AMOUNT");
  assertRule(priceMinor <= 10000000 && balance <= 1000000, "INVALID_AMOUNT");
  const maxPoints = Math.min(
    balance,
    Math.floor(
      (priceMinor * SANDBOX_POINTS_POLICY.coverageBps) /
        10000 /
        SANDBOX_POINTS_POLICY.pointMinor,
    ),
  );
  assertRule(points <= maxPoints, "POINTS_LIMIT");
  const coverageMinor = points * SANDBOX_POINTS_POLICY.pointMinor;
  return {
    policyVersion: SANDBOX_POINTS_POLICY.version,
    priceMinor,
    maxPoints,
    points,
    coverageMinor,
    athleteDueMinor: priceMinor - coverageMinor,
    pointsDebited: 0 as const,
    settlement: "NOT_CONNECTED" as const,
  };
}

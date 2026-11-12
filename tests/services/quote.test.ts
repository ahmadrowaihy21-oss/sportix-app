import test from "node:test";
import assert from "node:assert/strict";
import { previewPointsQuote } from "../../src/lib/services/quote.ts";
test("quote conserves original price across 1000 integer prices without moving points", () => {
  for (let price = 0; price < 1000; price++) {
    const max = previewPointsQuote(price, 0).maxPoints;
    const quote = previewPointsQuote(price, max);
    assert.equal(quote.priceMinor, quote.coverageMinor + quote.athleteDueMinor);
    assert.ok(quote.coverageMinor <= Math.floor(price * 0.3));
    assert.equal(quote.pointsDebited, 0);
  }
});
test("coverage rejects negative, fractional, over-balance and over-cap values", () => {
  for (const p of [-1, 1.5, NaN, 301])
    assert.throws(() => previewPointsQuote(10000, p));
  assert.throws(() => previewPointsQuote(10000, 200, 100));
  assert.equal(previewPointsQuote(10000, 200).athleteDueMinor, 8000);
});

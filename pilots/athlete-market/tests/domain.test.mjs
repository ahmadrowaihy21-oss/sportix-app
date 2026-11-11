import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, transition, marketQuote, maxPointsFor, MARKET_POLICY } from '../src/domain.ts';
const reserve = (state, points = 200, id = 'order-1') => transition(state, 'redeem', { offerId: 'recovery', points, policyVersion: MARKET_POLICY.version }, id, 1000);

test('partial coverage balances athlete and SPORTIX obligations exactly', () => {
  const quote = marketQuote('recovery', 200, 250);
  assert.equal(quote.priceMinor, 10000);
  assert.equal(quote.coverageMinor, 2000);
  assert.equal(quote.athleteDueMinor, 8000);
  assert.equal(quote.priceMinor, quote.coverageMinor + quote.athleteDueMinor);
  assert.equal(maxPointsFor('recovery', 9999), 300);
  for (const points of [0, -1, 1.5, NaN, Infinity, 301]) assert.throws(() => marketQuote('recovery', points, 9999));
  assert.throws(() => marketQuote('recovery', 201, 200));
});

test('frozen order quote, cancellation and refund are single use', () => {
  let state = reserve(initialState());
  assert.equal(state.balance, 50);
  assert.equal(state.redemptions[0].quote.coverageMinor, 2000);
  assert.equal(state.redemptions[0].settlementStatus, 'not_connected');
  assert.throws(() => reserve(state, 200, 'order-2'));
  state = transition(state, 'cancel', { redemptionId: 'order-1' }, 'cancel-1');
  assert.equal(state.balance, 250);
  assert.equal(state.redemptions[0].settlementStatus, 'cancelled');
  assert.throws(() => transition(state, 'cancel', { redemptionId: 'order-1' }, 'cancel-2'));
});

test('fulfilment requires explicit simulated payment, never records actual settlement', () => {
  let state = reserve(initialState());
  assert.throws(() => transition(state, 'deliver', { redemptionId: 'order-1' }, 'delivery-1'));
  state = transition(state, 'simulate_payment', { redemptionId: 'order-1' }, 'payment-1', 2000);
  assert.throws(() => transition(state, 'simulate_payment', { redemptionId: 'order-1' }, 'payment-2'));
  state = transition(state, 'deliver', { redemptionId: 'order-1' }, 'delivery-2');
  assert.equal(state.balance, 50);
  assert.equal(state.redemptions[0].status, 'delivered');
  assert.equal(state.redemptions[0].settlementStatus, 'not_connected');
  assert.throws(() => transition(state, 'cancel', { redemptionId: 'order-1' }, 'cancel-1'));
});

test('publish needs explicit consent and valid title; withdrawal cannot farm points', () => {
  let state = transition(initialState(), 'start', { sport: 'الجري' }, 'session-1', 1000);
  assert.throws(() => transition(state, 'start', { sport: 'الجري' }, 'session-2', 2000));
  state = transition(state, 'end', { activityId: 'session-1' }, 'end-1', 61000);
  state.activities[0].mediaPath = 'evidence.png';
  const payload = { activityId: 'session-1', title: 'جلسة اليوم', consent: true };
  assert.throws(() => transition(state, 'publish', { ...payload, consent: false }, 'publish-0'));
  assert.throws(() => transition(state, 'publish', { ...payload, title: 'ا' }, 'publish-0'));
  state = transition(state, 'publish', payload, 'publish-1');
  assert.equal(state.balance, 300);
  state = transition(state, 'withdraw', { activityId: 'session-1' }, 'withdraw-1');
  assert.equal(state.balance, 300);
  assert.equal(state.activities[0].published, false);
  assert.throws(() => transition(state, 'publish', payload, 'publish-2'));
});

test('audit ledger reconciles balance and old records remain intact', () => {
  const old = initialState(); delete old.events;
  old.redemptions.push({ id: 'legacy-1', offer: 'recovery', cost: 200, status: 'delivered', at: 0 });
  let state = reserve(old);
  state = transition(state, 'cancel', { redemptionId: 'order-1' }, 'cancel-1');
  assert.equal(state.balance, 250 + state.events.reduce((sum, event) => sum + event.pointsDelta, 0));
  assert.equal(state.redemptions[1].quote, undefined);
  assert.equal(old.balance, 250);
  assert.throws(() => transition(initialState(), 'redeem', { offerId: 'recovery', points: 200, policyVersion: 'stale' }, 'x'));
  const capped = initialState(); capped.activities = Array.from({ length: 100 }, (_, i) => ({ id: String(i), sport: 'الجري', startedAt: 1, endedAt: 2 }));
  assert.throws(() => transition(capped, 'start', { sport: 'الجري' }, 'start-limit'));
  assert.doesNotThrow(() => transition(capped, 'profile', { name: 'رياضي جديد' }, 'edit-limit'));
});

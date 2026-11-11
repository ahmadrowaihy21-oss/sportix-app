# SPORTIX ATHLETE / MARKET engineering contract

## Product decision
SPORTIX MARKET is the athlete-facing catalogue. SPORTIX PARTNERS remains the partner onboarding and operations portal; it is not implemented by renaming this catalogue.
A purchase has an original SAR price, a points-funded portion borne by SPORTIX, and an athlete-paid remainder. SPORTIX pays the covered portion to the partner only through a separately connected settlement system.

The current pilot has no payment gateway, settlement provider, real merchant offer or verified sports-analysis integration. `simulate_payment` is not proof of payment. `settlementStatus: not_connected` must never be rendered as paid.

## Fixed demonstration policy
`market-sandbox-v1`: one point covers 10 minor currency units (0.10 SAR), at most 30% of a product's price. These figures are engineering fixtures, not an approved commercial policy. All arithmetic uses safe integers in minor units; clients cannot set prices, coverage values or the server wallet balance. A quote is frozen on the order. Legacy orders have no invented financial snapshot.

## Atomic state and retry rules
The server derives a hash-scoped table from the authenticated identity. Every effect and its request receipt are committed in the same database transaction with an expected profile revision. Object keys are canonicalized for request fingerprints. A replay must have the same payload; a missing receipt after a timeout does not prove no commit happened. The client retains the request ID in per-account session storage and retries the same uncertain request; it blocks a different mutation while that outcome remains unresolved.

Profile events store operation ID, resource reference, time, revision, point delta and balance. They are internal audit records capped at 200 recent events, not a durable external outbox. Request receipts remain separate and are not deleted on cancellation. Events contain no raw files. This pilot does not promise exactly-once delivery to external systems.

## State machines
Session: active -> ended -> media attached -> explicitly consented publication -> optional withdrawal. Consent is checked on the server. Withdrawal removes the public entry atomically, preserves private session history and cannot award another publication reward. Previously issued media URLs can remain accessible until their existing expiry; no instant-revocation claim.

Market order: reserved -> simulated remainder payment -> simulated fulfilment. Cancellation of a reserved order refunds points once. A fulfilled order cannot be cancelled through the reservation-refund endpoint. Future real refunds require a separate merchant/payment workflow. Legacy trial orders can still be handled without fabricated money values.

## Media and AI boundaries
Uploads accept signature-checked JPEG/PNG/WebP/MP4/WebM up to 2 MB. A media attachment is unverified evidence, not measured athletic performance. No pose detection, injury diagnosis, effort inference or talent ranking is performed. The workflow can later carry an evidence reference and model/version, but must not invent measurements to fill missing stages.

## Next real integrations
1. Partner catalogue with merchant IDs, offer validity, stock/capacity and signed commercial terms.
2. Approved points policy, financial liability ownership, partial-payment handling, refunds and reconciliation.
3. Payment and settlement adapters with authenticated webhooks, durable outbox, bounded retries and dead-letter review. Verify webhook authenticity separately from idempotency.
4. Academy/club/federation roles and human verification approvals separate from community posting and rewards.
5. Moderation, takedown/reporting, privacy/retention/deletion, load and two-account end-to-end tests.

No Gmail, Drive, GitHub or calendar access is delegated to athletes. Connected assistant tools are not product integrations. GitHub CI validates business rules; it does not auto-deploy AppDeploy or move funds.

## Repeatable instruction template
Outcome -> approved product rules -> source/version -> invariants -> implementation -> failure cases -> test evidence -> reviewable release. Scope every change to the smallest business outcome; distinguish implemented, locally tested, provider-confirmed and publicly deployed. Promote a reusable rule only after a baseline comparison and a meaningful edge case. This is engineering documentation, not model-weight training.

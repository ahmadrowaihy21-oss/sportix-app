# SPORTIX PARTNERS — Railway sandbox adapter

Prepared code, **not deployed or PostgreSQL-tested**. Railway creation on 2026-11-09 failed with: "Your trial has expired. Please select a plan to continue using Railway."

This service implements the same synthetic command engine as the private Site, using one PostgreSQL client and row lock per workspace transaction. Audit, outbox and idempotency receipts commit with the aggregate document. The live Site currently uses its D1 adapter; these are alternate storage adapters, not two databases to dual-write.

After the Railway plan is active:

1. Create an isolated sandbox project and PostgreSQL service. Keep the database private.
2. Deploy this folder as a service. Set `DATABASE_URL` to the private database reference and `SANDBOX_SERVICE_TOKEN` to a securely generated secret of at least 32 characters. Never put either in browser code.
3. The pre-deploy command runs the bounded schema migration. `/health` checks the database.
4. A trusted BFF must authenticate visitors, derive the owner identifier, and call `/v1/sandbox` with Bearer service authorization and `X-Sportix-Sandbox-Owner`. Browser CORS is deliberately absent.
5. Run the concurrency, isolation, replay, expiry and recovery gates against this deployed adapter before routing the Site to it. Migrate the sandbox data once at cutover; do not independently write D1 and PostgreSQL.

`workflow.mjs` is bundled from `lib/workflow.ts`, `lib/market.ts` and `lib/booking.ts` by `scripts/build-railway.mjs`. Rebuild it after domain changes. Local D1 test evidence does not establish PostgreSQL, multi-instance Railway, provider or production correctness.

All payment authorizations and notification acknowledgments remain synthetic. Outbound delivery is disabled. This is not the production normalized marketplace database or real organization IAM.

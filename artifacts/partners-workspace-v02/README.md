# SPORTIX PARTNERS & ROOMS CONNECT MVP

Private, Arabic unified partner workspace. Synthetic data only. Modules: Rooms Connect, Coupons & Subscriptions, Products, SPORTIX IMPACT.

The deployed Site uses a real owner-isolated D1 sandbox with atomic revision updates, audit, outbox and idempotency receipts. Domain roles, payment, shipping, notification acknowledgments and time remain simulated. Existing local Rooms lab is separately labeled. This is not a live partner marketplace.

## Commands

```sh
npm ci
npm run typecheck
npm run review:build
npm run test:backend
npm run build:railway
npm run build
```

62 checks: 28 Rooms domain, 24 Market domain, 10 HTTP/D1 local database tests. The D1 tests run in an isolated Miniflare database with 100 concurrent booking requests, 100 coupon redemptions and 20 stock requests.

## Main files

- `docs/ARCHITECTURE_IMPLEMENTED_AR.md`: implemented architecture, workflow, integrations, limitations and sources.
- `public/specs/sandbox-openapi.json`: implemented private sandbox API.
- `public/specs/openapi.json`: 26 proposed production API paths, not deployed.
- `backend/railway/`: PostgreSQL alternate sandbox adapter with locked transaction. Deployment blocked by expired Railway trial; PostgreSQL behavior is not yet tested.
- `public/SPORTIX_PARTNERS_ROOMS_CONNECT_REVIEW.html`: portable offline review. Local rooms lab works; server-persisted Market requires the live Site.

The managed Sites source repository is canonical for the live workspace. A separate GitHub review package is additive and does not wire the existing ATHLETE routes to this sandbox. No Slack messages, payment calls, calendar events or Analytics Hub data exchanges are sent or created by this app.

# SPORTIX website MVP release scope — 2026-11-11

This release publishes the existing SPORTIX web app from the `sportix-app` repository, including the Academy browser-local pilot and GO SPORTIX boxing workspace. Netlify's production project is `sportix-app`.

## Release scope

Ready for a synthetic-data product walkthrough: navigation, local Academy roster and report creation, approval and athlete-history view, SPORT ID screens, community, GO SPORTIX and marketplace prototype flows.

The Academy pilot stores data in this browser only. View switching is not authorization. No real athlete or institutional data should be entered in this release. Google account authentication, organizational memberships, persistent Academy report APIs, consent service, event publisher/consumer and an Academy Report projection inside SPORT ID remain release gates for an institutional pilot. Payments and activity verification remain prototype flows.

## Verification

- `npm run typecheck`: passed.
- `npm run build:netlify`: passed.
- Product tests for app-data, readiness schedule, gate identity, sign-in gate and Academy model: 60 passed, zero failed.
- Full template-script suite: 179 passed and 16 failed. Failures include absent `.grok` template/skill fixtures and template branding expectations. This release does not claim an entirely green repository suite.
- Browser checks of the final deployed URL are recorded in the release response; local browser installation initially failed because the browser download returned a truncated archive.

## Deployment changes

Repair package-lock dependency placement so clean installation can succeed. Ignore local dependency and Netlify linking directories. Connect the already-public repository to the existing Netlify project so production builds use `main`, `npm run build:netlify`, `dist` and `.netlify/functions-internal` from the checked-in configuration.

Status: synthetic MVP website; not approved as a fully integrated institutional production system.

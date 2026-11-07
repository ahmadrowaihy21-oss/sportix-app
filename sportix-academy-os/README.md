# SPORTIX ACADEMY OS — Netlify Full-stack Port

This is a **Netlify-ready source project**, adapted from SPORTIX ACADEMY OS V2, including the Arabic RTL interface, training workflow, 12-domain manual evaluations, quality scoring, video evidence, and two AI report flows.

## Production dependencies

- **Netlify Identity**: enable under Project → Identity. Use invitation-only registration for pilot academies; email confirmation recommended. Existing AppDeploy user accounts are **not** automatically transferred.
- **Netlify Database**: database schema is at `netlify/database/migrations/20261104130000_academy_records.sql`. The package `@netlify/database` is included; deploy on a plan that supports it. Do not insert actual minors' records before RBAC, guardian verification, and data-governance assessment.
- **Netlify Blobs**: stores short evidence files for logged-in accounts. Files remain private through an authenticated Netlify Function.
- **Netlify AI Gateway**: required for AI generation. Enable for the Netlify account, deploy to production, check available model names, and configure `SPORTIX_AI_MODEL` if the default is not supported. AI runs on the server, not in the browser; usage may incur credits.

## Publish

1. Extract this ZIP into a Git repository; run `npm install` and `npm run build`.
2. Connect the repository to the dedicated **sportix-academy-os** Netlify project (do not overwrite the existing `acpf-sportix-academy` portfolio).
3. Set build command `npm run build`, publish directory `dist`; `netlify.toml` contains this configuration. Netlify handles Functions and DB migrations on deploy.
4. Enable Identity in Netlify dashboard and configure registration policy. Verify `/api/_healthcheck` and authenticated bootstrap.
5. After real HTTPS deployment and pilot checks, connect an optional new subdomain. The existing `acpf.sportixpartners.com` currently belongs to the portfolio; moving it would replace that site.

## Important boundaries

- AppDeploy databases and accounts are not migrated by this source export. A separately authorized data export/import is required.
- The public demo uses **fictional data** in browser local storage. This is not real AI inference.
- Server-based AI requires the gateway, valid account, sufficient records and credits; model output is explicitly for human review, with no invented CV, medical or psychological analysis.
- This code is not an indication of completed commercial readiness. Formal tenancy, staff permissions, athlete/guardian verification, consent evidence, and production security testing remain necessary.
- Netlify Identity must be configured in the dashboard; it is not enabled by deploying code alone.

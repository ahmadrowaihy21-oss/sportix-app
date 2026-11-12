> وثيقة تاريخية من حزمة 11 نوفمبر؛ الحالة الحالية والاختبارات والحدود في [تغطية MVP](../athlete-mvp-coverage-ar.md).

# SPORTIX ATHLETE integration review package

Local proposal only. Do not push, open/merge a PR, deploy, or trigger GitHub Actions without the owner's explicit approval. There are no remote commands, installation hooks, migrations, provider calls, or workflow files in this proposal.

Base: ahmadrowaihy21-oss/sportix-app @ 62011704c6e56d732948a66dbc1cbfed4f211e38.
Partner reference: PR #2 @ 6db3b3f6093a7f289017d2245fb336dc17e6d8af (read-only; not merged).

In a separate local checkout at the exact base, first inspect `proposed.patch` and run:

```sh
git apply --check /path/to/proposed.patch
git apply /path/to/proposed.patch
npm ci --ignore-scripts
npm run test:athlete
npm run typecheck:athlete
VITE_AUTH_ENABLED=false npm run build:netlify
```

These are local commands, not a deployment. Install exact lockfile dependencies in an environment with npm registry access. The provided evidence used cached dependency versions; see REVIEW_AR.md and TEST_RESULTS.json. For a full local regression comparison run `npm test`; this base currently has 16 known script failures, so also execute the domain test files listed in `package.json` independently. The new tests do not need database or credentials.

Test the existing GO flow with the added USE SYNTHETIC EVIDENCE action. Default audience is private; make a deliberate choice to see a synthetic community summary. Change back to private to withdraw it. SPORT ID shows a separate private test record, with no verified totals or SSP increase. `/marketplace-integration` previews three partner contract types and ends in AWAITING_OPERATIONAL_BACKEND. Legacy checkout, redemption and order completion are blocked in the proposal.

Read the identity and API documents before implementing any production adapter. An operational identity schema is a data-shape validator, not authentication. Do not migrate fixtures or local state into real athlete accounts. Approval to apply this code is not proof of production readiness.

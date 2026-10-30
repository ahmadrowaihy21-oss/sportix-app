# Academy pilot — first reviewable slice

## User journey

Open `/academy` from the new Sport ID entry. Add a **fictional alias**, position and unique shirt number; select the athlete; record a manual sample session; review its metrics and source; approve it; switch to the athlete journey to see approved sessions and the distance history. Reports below 95% coverage cannot be approved. A new athlete starts with no fabricated performance data.

## Scope and boundaries

This is a browser-local demonstrator, not a production academy information system. All seed data are synthetic. No API keys, AI calls, uploads, cameras, actual identity verification, inferred psychological labels or automatic talent rankings are included. The page explicitly identifies manual/sample sources and the absence of connected measurement systems. Switching views is **not authorization**. Do not enter real athlete data.

The existing Sport ID shell, authentication helpers and product routes remain intact. `/academy` owns a standalone responsive Arabic workspace using the established dark/lime palette. Data are versioned under `sportix.academy.preview.v1`; persisted state is validated before use and storage failures are visible. No server, telemetry or third-party API receives the demo inputs.

## Proposed API-first production boundary (not implemented)

Replace local persistence with a repository adapter behind the same UI. Serve routes only after real sign-in and a verified academy membership. Resolve tenant and subject from the server session; never trust a selected role or client-sent tenant ID. Athlete-to-Sport-ID linkage requires a separate verified assignment; the preview UUIDs are not real Sport IDs.

| Endpoint                             | Permission                                        | Result                                   |
| ------------------------------------ | ------------------------------------------------- | ---------------------------------------- |
| GET /api/academies/current/athletes  | academy administrator or assigned coach           | scoped roster                            |
| POST /api/academies/current/athletes | academy administrator                             | validated athlete record                 |
| GET /api/athletes/:id/reports        | assigned coach; athlete gets approved subset only | scoped reports                           |
| POST /api/athletes/:id/reports       | assigned coach or authorized ingestion service    | draft with provenance                    |
| POST /api/reports/:id/approve        | assigned reviewer                                 | transactional approval with audit record |

Production requirements: migrations for academy memberships and athlete assignments; verified guardian consent where applicable; row-level/query isolation; server-side validation and coverage checks; version conflict handling; explicit metric definitions and units; provenance and model/calibration versions; signed video references; retention/deletion controls; access audit; and browser/API end-to-end tests including cross-tenant denial. The 95% preview threshold is an internal gate, not a certified accuracy claim. Manually entered metrics must remain labeled and must not become camera-verified through approval.

## Verification

`node --experimental-strip-types --test src/lib/academy/model.test.ts` exercises validation, state parsing, draft visibility, approval idempotence, and low-coverage refusal. `npm run typecheck` and `npm run build:netlify` verify repository integration. The repository's pre-existing lockfile is inconsistent (`npm ci` reports missing ajv/json-schema-traverse entries); installation for review used `npm install --package-lock=false`, without modifying dependency inputs. This should be reconciled separately by the project owner.

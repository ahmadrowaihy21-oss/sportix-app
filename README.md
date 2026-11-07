# SPORTIX Netlify recovery

Private maintenance backup recovered from the account's published Netlify deploy archives on 2026-11-07. This repository groups the existing sites without combining their design systems or changing domain ownership. Each directory remains a separate Netlify project.

Five directories contain editable source. `stadium-os/publish` is an explicitly preserved deployment snapshot: the current React app's original source was absent from its archive. The older nested Stadium landing page is retained within that snapshot but is not a replacement for the current application.

## Site inventory

| Directory | Public domain | Netlify project | Site ID | Existing build and publish settings |
| --- | --- | --- | --- | --- |
| `studio` | `studio.sportixpartners.com` | `project-r-studio` | `2b399d8b-828c-4629-9f24-bcd6f73bb362` | Node 24; `npm ci`, `npm test`, `npm run build`; publish `dist`; functions `netlify/functions` |
| `stadium-os/publish` | `osstadium.sportixpartners.com` | `stadium-os` | `8f5cc319-3469-4bfc-b4b6-59f9d99a3303` | Static deployment snapshot; no build command; publish this directory |
| `sportix-academy-os` | `academyos.sportixpartners.com` | `sportix-academy-os` | `a73df692-1fca-469d-ab0c-6683cfb5d5e2` | Node 24; `npm ci`, `npm test`, `npm run build`; publish `dist`; functions `netlify/functions` |
| `sportix-ecosystem-portfolio` | `ecopf.sportixpartners.com` | `sportix-ecosystem-portfolio` | `66e83427-e543-4504-9052-9fffede38c44` | Static HTML/CSS/JS; no build; publish site directory |
| `hayvra` | `hayvra.sportixpartners.com` | `hayvra` | `3e99f7c3-7b78-4574-aa51-725d0e27aa63` | Node 22; see `netlify.toml` for Netlify build and asset check; publish `dist` |
| `sportix-portfolio` | `portfolio.sportixpartners.com` | `sportix-portfolio` | `983e28e2-5279-4077-8163-2a6e9108d8d1` | Node 22; `npm ci`, `npm run build`; publish `dist` |

This repository is a backup, not an instruction to relink any project or change its primary domain. Existing Studio metadata refers to a Netlify-managed hgit repository. Portfolio metadata refers to `ahmadrowaihy21-oss/passport`; verify its relationship to the recovered source before changing continuous deployment. The other recovered custom-domain projects had no repository configured in their build settings.

## Backend and authentication boundaries

- **Studio:** this archive contains its frontend and Netlify function bridge. The actual backend and D1 database remain in a private Sites project. Its backend source was separately recovered and verified against private Sites version 47; it is retained in that existing project rather than duplicated in this backup. `PROJECT_R_BRIDGE_CONFIG` and backend environment settings must be supplied through the existing hosting configuration. The recovered code is a private founder portal; it is not a completed customer authentication system.
- **Academy OS:** real accounts depend on configured Netlify Identity. Its server routes depend on Netlify Database and Blobs, while real AI generation also requires the AI Gateway. The public demonstration uses fictional local data. AppDeploy accounts and data were not migrated. Staff permissions and guardian verification remain separate launch requirements documented in the site's README.
- **Hayvra and Portfolio:** source includes generated platform authentication and database support. A source backup does not provision the external authentication broker, database, provider credentials, or other account services. Review each site's existing environment before running migration scripts or enabling authentication.
- **Stadium:** the snapshot preserves the current interface and deployable assets. Changes beyond static repairs require recovery or reconstruction of the original application source.
- **Ecosystem portfolio:** this is a static product demonstration. Preserving its files does not turn its illustrated workflows into shared production services.

## Backup hygiene

No Netlify CLI configuration, access tokens, `.env` files, private key files, downloaded ZIPs, `node_modules`, build caches, generated SSR output, screenshots, working logs, or original upload attachments are included. Runtime assets required by the static sites are retained.

Two recovered files originally contained a shared Grok development-preview OAuth client credential: `hayvra/src/lib/auth/preview.ts` and `sportix-portfolio/src/lib/auth/preview.ts`. In this backup only, that literal is replaced with `process.env.GROK_PREVIEW_CLIENT_SECRET ?? ""`. The preview broker secret must be provided through an authorized environment when that development-only login path is needed. No production credential is supplied here.

A conservative pattern scan found no remaining provider-key, private-key, JWT, or URL-embedded credential matches. Its remaining assignment-pattern hits were HTML password-field markup and synthetic Studio test fixtures. This is a bounded pattern check, not a full security assessment.

`recovered-sites.json` records source deploy IDs and source kinds. `source-manifest.json` records file hashes for the prepared backup; refresh it when updating files. A successful source recovery does not establish that all product features or external dependencies are production-ready.

## Maintenance fixes in this backup

The archives are the recovery baselines, and this repository also retains the verified maintenance fixes prepared during recovery. `recovery-changes.json` lists every added or modified file relative to each original ZIP, with original/current hashes.

- **Stadium:** corrected a stale stylesheet reference and supplied the missing web manifest, preserving the current compiled application assets.
- **Hayvra:** corrected the stylesheet integration causing a server/client asset hash mismatch; added a build-time rendered-asset check; refreshed the dependency lockfile so the build installs successfully.
- **Academy OS:** includes the latest API and test fixes in `netlify/functions/academy.mts` and `tests/academy.test.ts` (20 tests passed in the implementation workspace).
- **Portfolio:** includes the latest navigation correction in `src/components/deck/DeckShell.tsx`.
- **Hayvra and Portfolio:** the development-preview credential redaction described above is a backup-only environment substitution; it is distinct from the product fixes.

Studio and Ecosystem are retained from their recovered archives without product code edits at this snapshot. Studio README additionally records the separate private backend recovery. Netlify runtime environment values and the Studio private backend are not stored here. Publishing this repository does not enable continuous deployment or alter any live site configuration.

## Private backup location and deploy linkage

Creating a new private `sportix-netlify-recovered` repository was denied by the GitHub integration's repository-creation permission. This multi-site recovery snapshot is therefore stored on the dedicated `maintenance/netlify-recovered-2026-11-07` branch in the existing private `ahmadrowaihy21-oss/sportix-app` repository. It does not replace that repository's `main` branch or enable continuous deployment for these six sites.

Portfolio's Netlify project still points at the stale `ahmadrowaihy21-oss/passport` Git continuous-deployment source, which differs from this recovered source snapshot. Its corrected manual deployment will be kept locked while that source link is unresolved, so a later push to the stale repository cannot silently replace the repaired site. Verify the published deploy's lock and the intended repository before changing that project's publishing settings. This backup does not change those settings or assert that the link has been corrected.


The [2026-11-07 completion record](COMPLETION-2026-11-07.md) records the verified production deploys, Portfolio lock, Studio access control, and the remaining bridge-configuration approval. It also distinguishes the merged root-site source fix from the unchanged live Manus deployment.

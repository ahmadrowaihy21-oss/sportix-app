# PROJECT R STUDIO — Netlify

Private Netlify frontend for the unified client portal and ROWAIHY MIND Core dashboard.

- `/studio.html`: client portal
- `/admin`: founder dashboard, Operations Hub and live orders
- Netlify Functions verify the platform-provided `context.user`; only the configured founder may use this private MVP.
- The backend and D1 database remain on the existing private Sites project. Data is not duplicated.
- An HMAC-signed server bridge calls the existing backend; its signature expires after 60 seconds and each nonce is single-use.
- Credentials belong only in the Netlify `PROJECT_R_BRIDGE_CONFIG` environment variable and backend environment variables. Never put them in this archive or static files.
- Keep Netlify project visibility Private. A public customer launch needs a separately implemented customer authentication flow.
- AI and analytics features retain their existing setup requirements. This deployment does not provision provider API keys.

## Build

Node 24, `npm ci`, `npm test`, `npm run build`.
Upload the source ZIP while signed into Netlify (automatic build), or connect a private Git repository. The `dist` directory contains only public application assets; functions must be deployed from source.

The backend change is versioned in the existing Sites repository. This archive contains the Netlify frontend and function source only, with no live customer data or secrets.

## Existing backend provenance

The private Sites backend is project `appgprj_6aebc257f8408191b6292a08143c1c78`,
`https://rowaihy-project-ai.ahmadrowaihy.chatgpt.site`. Version 47 is built from
source commit `6388eebb1228707b7f4e3e27ec7aa94fb11a0c56`; it fixes Core authentication
for the HMAC-verified Netlify bridge while retaining Google verification for
ordinary Sites requests. The existing D1 owner mapping and provider settings are
preserved. These identifiers are provenance, not credentials.

Production requests require Netlify team-login protection for `context.user` to
be populated; a public production site cannot use this founder-only bridge.
Bridge credentials are configured as a production secret with the standard Netlify
secret scopes (`builds`, `functions`, `runtime`), excluding post-processing. The
current plan does not offer scope selection. Only the server function reads this
key; the build does not inject it into public assets. Apply changes with a new
deployment. Never embed the Sites
bearer token or shared HMAC key in this source or the public build.

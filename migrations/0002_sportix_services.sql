-- Provision accounts/memberships/workspaces through a trusted admin process.
-- No self-service endpoint grants partner or reviewer roles. No synthetic seed in production.
CREATE TABLE IF NOT EXISTS sportix_service_accounts (
  user_id text PRIMARY KEY, active boolean NOT NULL DEFAULT true,
  adult boolean NOT NULL DEFAULT false
);
CREATE TABLE IF NOT EXISTS sportix_service_memberships (
  user_id text NOT NULL REFERENCES sportix_service_accounts(user_id),
  tenant_id text NOT NULL, role text NOT NULL CHECK (role IN ('partner','reviewer')),
  active boolean NOT NULL DEFAULT true, PRIMARY KEY(user_id, tenant_id, role)
);
CREATE TABLE IF NOT EXISTS sportix_service_workspaces (
  tenant_id text PRIMARY KEY, revision integer NOT NULL DEFAULT 0 CHECK (revision >= 0),
  state jsonb NOT NULL CHECK (state->>'mode' = 'operational')
);

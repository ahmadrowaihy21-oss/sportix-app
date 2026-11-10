CREATE TABLE IF NOT EXISTS sandbox_workspaces (
  owner text PRIMARY KEY,
  revision bigint NOT NULL DEFAULT 0 CHECK (revision >= 0),
  document jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

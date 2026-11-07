-- Scoped academy records for Netlify Database (per authenticated account).
CREATE TABLE IF NOT EXISTS sportix_academy_records (
  owner_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  id TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (owner_id, kind, id)
);
CREATE INDEX IF NOT EXISTS sportix_academy_records_owner_kind_created
  ON sportix_academy_records (owner_id, kind, created_at DESC);

-- PROPOSED ONLY. Not executed, not a migration for an existing database.
-- Requires PostgreSQL and prior creation of the resource and room tables.
CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE TABLE allocation (
  id uuid PRIMARY KEY,
  resource_id uuid NOT NULL REFERENCES resource(id),
  room_id uuid NOT NULL REFERENCES room(id),
  during tstzrange NOT NULL,
  status text NOT NULL CHECK (status IN ('HOLD','CONFIRMED','RELEASED')),
  active boolean NOT NULL,
  lease_token uuid,
  expires_at timestamptz,
  version bigint NOT NULL DEFAULT 1,
  CHECK (NOT isempty(during) AND NOT lower_inf(during) AND NOT upper_inf(during)),
  CHECK (lower_inc(during) AND NOT upper_inc(during)),
  CHECK (active = (status IN ('HOLD','CONFIRMED'))),
  CHECK (status <> 'HOLD' OR (lease_token IS NOT NULL AND expires_at IS NOT NULL)),
  EXCLUDE USING gist (resource_id WITH =, during WITH &&) WHERE (active)
);
CREATE UNIQUE INDEX one_active_allocation_per_room ON allocation(room_id) WHERE active;
-- All mutations lock resource rows in a deterministic order to avoid deadlocks.
-- Expiration marks active=false/status=RELEASED for expired HOLDs under that lock.
-- CONFIRM atomically changes HOLD to CONFIRMED; it does not release the row.
-- Maintenance creation must acquire the same resource lock before writing.
-- Inspect booking version, server clock, live availability and payment evidence
-- inside the transaction; write booking+audit+outbox before COMMIT.
-- Transaction failures map to 409 SLOT_CONFLICT; no retries with changed payload
-- under the same Idempotency-Key. Bound serialization retries on the server.

-- Optional: strip embedded camera data from historical payloads.
-- Operational Intel no longer selects `payload`, but this keeps the table lean
-- and prevents Postgres statement timeouts on any remaining select(*).
-- Safe to re-run.

UPDATE gamecount.field_observations
SET payload = payload - 'photo_uri'
WHERE payload ? 'photo_uri';

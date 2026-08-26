-- ============================================================
-- WEZ: 24-hour static pan surveys
-- Run in Supabase → SQL Editor (schema: gamecount)
-- Additive — does not drop existing transect data.
-- ============================================================

ALTER TABLE gamecount.field_observations
  ADD COLUMN IF NOT EXISTS observers TEXT,
  ADD COLUMN IF NOT EXISTS young_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sighting_time TEXT,
  ADD COLUMN IF NOT EXISTS session_date DATE,
  ADD COLUMN IF NOT EXISTS session_slot TEXT,
  ADD COLUMN IF NOT EXISTS static_site_name TEXT,
  ADD COLUMN IF NOT EXISTS temperatures JSONB;

-- Enable pg_trgm extension
-- This needs to be run once per database
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Verify it's enabled
SELECT * FROM pg_extension WHERE extname = 'pg_trgm';

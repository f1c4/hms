-- Run this AFTER enabling pg_trgm extension

-- Individual GIN indexes for each searchable column
-- These will speed up ILIKE '%term%' queries significantly
CREATE INDEX IF NOT EXISTS idx_patient_general_first_name_trgm 
ON patient_general USING gin (first_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_patient_general_last_name_trgm 
ON patient_general USING gin (last_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_patient_general_national_id_trgm 
ON patient_general USING gin (national_id_number gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_patient_general_phone_trgm 
ON patient_general USING gin (phone gin_trgm_ops);

-- B-tree indexes for sorting (these are fast for ORDER BY)
CREATE INDEX IF NOT EXISTS idx_patient_general_created_at 
ON patient_general (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_patient_general_first_name_btree 
ON patient_general (first_name);

CREATE INDEX IF NOT EXISTS idx_patient_general_last_name_btree 
ON patient_general (last_name);
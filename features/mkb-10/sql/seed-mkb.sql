-- File: e:\Projects\webmed\supabase\migrations\import_mkb_data.sql

-- Step 1: Create a temporary staging table to receive the raw CSV data.
-- This structure exactly matches your 'mkb_data.csv' file.
DROP TABLE IF EXISTS public.mkb_10_staging;
CREATE TABLE public.mkb_10_staging (
    code TEXT,
    diagnosis_en TEXT,
    diagnosis_sr_latn TEXT,
    diagnosis_ru TEXT,
    diagnosis_lat TEXT
);

-- =================================================================================
-- PAUSE HERE: Now, go to the Supabase Table Editor.
-- 1. Select the `mkb_10_staging` table.
-- 2. Click "Insert" > "Import data from CSV".
-- 3. Upload your `mkb_data.csv` file.
-- 4. Ensure the columns in the preview match and click "Import".
-- 5. Wait for the import to complete before proceeding.
-- =================================================================================

-- Step 2: After the CSV import is done, run this query to migrate the data.
-- It selects from the staging table, builds the JSONB object, and inserts
-- into your final `mkb_10` table.
INSERT INTO public.mkb_10 (code, diagnosis_translations, diagnosis_la)
SELECT
    s.code,
    jsonb_build_object(
        'en', s.diagnosis_en,
        'sr-Latn', s.diagnosis_sr_latn,
        'ru', s.diagnosis_ru
    ),
    s.diagnosis_lat
FROM
    public.mkb_10_staging s
WHERE
    s.code IS NOT NULL AND s.code != ''
ON CONFLICT (code) DO UPDATE SET
    diagnosis_translations = EXCLUDED.diagnosis_translations,
    diagnosis_la = EXCLUDED.diagnosis_la;

-- Step 3: (Optional but recommended) Clean up by dropping the staging table.
DROP TABLE public.mkb_10_staging;

-- Step 4: Verify the data was inserted correctly.
SELECT code, diagnosis_translations, diagnosis_la FROM public.mkb_10 LIMIT 10;
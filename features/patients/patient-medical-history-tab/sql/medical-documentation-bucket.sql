-- =================================================================
--      [DEV-ONLY] SIMPLIFIED BUCKET & POLICIES SCRIPT
-- =================================================================
-- WARNING: This script applies PERMISSIVE policies for development.
-- It allows ANY authenticated user to read, write, update, and
-- delete ANY file in the 'patient_medical_documents' bucket.
--
-- DO NOT USE IN PRODUCTION.
--
-- Run this script to simplify local development.
-- =================================================================

-- =================================================================
-- 1. BUCKET CREATION
-- =================================================================
-- Create the 'patient_medical_documents' bucket if it doesn't exist.
-- This is idempotent and safe to run multiple times.
INSERT INTO storage.buckets (id, name, public)
VALUES ('patient-medical-documents', 'patient-medical-documents', false)
ON CONFLICT (id) DO NOTHING;

-- =================================================================
-- 2. ROW LEVEL SECURITY (RLS) POLICIES
-- =================================================================
-- Drop all old, complex policies for a clean slate.
DROP POLICY IF EXISTS "Allow select for authorized users medical documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow insert for authorized users medical documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow update for authorized users medical documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow delete for authorized users medical documents" ON storage.objects;
DROP POLICY IF EXISTS "DEV-ONLY: Allow all authenticated users full access to medical documents" ON storage.objects;

-- Create a single, simple policy that allows all authenticated users full CRUD access.
CREATE POLICY "DEV-ONLY: Allow all authenticated users full access to medical documents"
ON storage.objects FOR ALL
USING (
  bucket_id = 'patient-medical-documents' AND
  auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'patient-medical-documents' AND
  auth.role() = 'authenticated'
);

-- =================================================================
-- SCRIPT COMPLETE
-- =================================================================
-- Your 'patient_medical_documents' bucket is now configured with
-- permissive development policies.
-- =================================================================
-- Create the join table for document diagnoses
CREATE TABLE patient_medical_document_diagnoses (
    document_id BIGINT NOT NULL REFERENCES patient_medical_documents(id),
    diagnosis_code TEXT NOT NULL REFERENCES mkb_10(code),
    PRIMARY KEY (document_id, diagnosis_code)
);

-- Add comments to the table
COMMENT ON TABLE patient_medical_document_diagnoses IS 'Links medical documents to specific MKB-10 diagnoses.';

-- Create indexes for faster queries
CREATE INDEX idx_pmdd_document_id ON patient_medical_document_diagnoses(document_id);
CREATE INDEX idx_pmdd_diagnosis_code ON patient_medical_document_diagnoses(diagnosis_code);

-- Enable RLS
ALTER TABLE patient_medical_document_diagnoses ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- For now, allow any authenticated user to manage document diagnoses.
CREATE POLICY "Allow authenticated users to manage document diagnoses"
ON patient_medical_document_diagnoses
FOR ALL
TO authenticated
USING (true);

CREATE POLICY "Allow service_role to perform all actions"
ON patient_medical_document_diagnoses
FOR ALL
TO service_role
USING (true);
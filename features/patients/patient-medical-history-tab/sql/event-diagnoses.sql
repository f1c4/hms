-- Create the join table for event diagnoses
CREATE TABLE patient_medical_history_event_diagnoses (
    event_id BIGINT NOT NULL REFERENCES patient_medical_history_events(id),
    diagnosis_code VARCHAR(10) NOT NULL REFERENCES mkb_10(code),
    PRIMARY KEY (event_id, diagnosis_code)
);

-- Add comments
COMMENT ON TABLE patient_medical_history_event_diagnoses IS 'Links medical history events to specific MKB-10 diagnoses.';

-- Create indexes for performance
CREATE INDEX idx_pmhed_event_id ON patient_medical_history_event_diagnoses(event_id);
CREATE INDEX idx_pmhed_diagnosis_code ON patient_medical_history_event_diagnoses(diagnosis_code);

-- Enable RLS
ALTER TABLE patient_medical_history_event_diagnoses ENABLE ROW LEVEL SECURITY;

-- Define RLS Policies
CREATE POLICY "Allow authenticated users to manage event diagnoses"
ON patient_medical_history_event_diagnoses
FOR ALL
TO authenticated
USING (true);
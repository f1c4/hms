CREATE OR REPLACE FUNCTION get_patient_medical_history(p_patient_id BIGINT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  history_events_data JSON;
BEGIN
  SELECT COALESCE(json_agg(events ORDER BY events.event_date ASC), '[]'::json)
  INTO history_events_data
  FROM (
    SELECT
      pmhe.id,
      pmhe.patient_id,
      pmhe.title,
      pmhe.event_date,
      pmhe.notes,
      pmhe.ai_source_locale,
      pmhe.created_at,
      pmhe.updated_at,
      pmhe.created_by,
      pmhe.updated_by,
      pmhe.version,
      -- Nest diagnoses directly within each event
      (
        SELECT COALESCE(json_agg(diags), '[]'::json)
        FROM (
          SELECT
            pmhed.diagnosis_code,
            mkb.diagnosis_translations
          FROM patient_medical_history_event_diagnoses pmhed
          JOIN mkb_10 mkb ON pmhed.diagnosis_code = mkb.code
          WHERE pmhed.event_id = pmhe.id
        ) AS diags
      ) AS diagnoses,
      -- Nest documents within each event
      (
        SELECT COALESCE(json_agg(docs ORDER BY docs.document_date ASC), '[]'::json)
        FROM (
          SELECT
            pmd.id,
            pmd.event_id,
            pmd.document_type_id,
            pmd.document_date,
            pmd.notes,
            pmd.file_path,
            pmd.file_name,
            pmd.ai_source_locale,
            pmd.created_at,
            pmd.updated_at,
            pmd.created_by,
            pmd.updated_by,
            pmd.version,
            mdt.name_translations AS document_type_translations,
            -- Document-level diagnoses remain
            (
              SELECT COALESCE(json_agg(doc_diags), '[]'::json)
              FROM (
                SELECT
                  pmdd.diagnosis_code,
                  mkb.diagnosis_translations
                FROM patient_medical_document_diagnoses pmdd
                JOIN mkb_10 mkb ON pmdd.diagnosis_code = mkb.code
                WHERE pmdd.document_id = pmd.id
              ) AS doc_diags
            ) AS diagnoses
          FROM patient_medical_documents pmd
          JOIN medical_document_types mdt ON pmd.document_type_id = mdt.id
          WHERE pmd.event_id = pmhe.id
        ) AS docs
      ) AS documents
    FROM patient_medical_history_events pmhe
    WHERE pmhe.patient_id = p_patient_id
  ) AS events;

  RETURN history_events_data;
END;
$$;
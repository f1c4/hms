CREATE OR REPLACE FUNCTION get_full_patient_data(p_patient_id INT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  general_data JSON;
  personal_data JSON;
  risk_data JSON;
  notes_data JSON;
  id_documents_data JSON;
  insurances_data JSON;
BEGIN
  -- =================================================================
  -- Get general data --
  -- =================================================================
  SELECT json_build_object(
    -- Include all original snake_case columns from the table
    'id', pg.id,
    'created_at', pg.created_at,
    'updated_at', pg.updated_at,
    'created_by', pg.created_by,
    'updated_by', pg.updated_by,
    'version', pg.version,
    'first_name', pg.first_name,
    'last_name', pg.last_name,
    'date_of_birth', pg.date_of_birth,
    'phone', pg.phone,
    'email', pg.email,
    'residence_address', pg.residence_address,
    'national_id_number', pg.national_id_number,
    'emergency_contact_name', pg.emergency_contact_name,
    'emergency_contact_phone', pg.emergency_contact_phone,
    'emergency_contact_relation', pg.emergency_contact_relation,
    'residence_country_id', pg.residence_country_id,
    'residence_city_id', pg.residence_city_id,
    'citizenship_country_id', pg.citizenship_country_id,
    -- derived camelCase fields
    'residenceCountryIso2', rc.iso2,
    'citizenshipCountryIso2', cc.iso2,
    'residenceCity', CASE WHEN rci.id IS NOT NULL THEN json_build_object(
      'id', rci.id,
      'name', rci.name,
      'postal_code', rci.postal_code
    ) ELSE NULL END
  ) INTO general_data
  FROM patient_general pg
  LEFT JOIN countries rc ON pg.residence_country_id = rc.id
  LEFT JOIN countries cc ON pg.citizenship_country_id = cc.id
  LEFT JOIN cities rci ON pg.residence_city_id = rci.id
  WHERE pg.id = p_patient_id;

  -- =================================================================
  -- Get identity documents for the patient --
  -- =================================================================
  SELECT json_agg(
    json_build_object(
      'id', d.id,
      'patient_id', d.patient_id,
      'document_type', d.document_type,
      'document_number', d.document_number,
      'issue_date', d.issue_date,
      'expiry_date', d.expiry_date,
      'file_path', d.file_path,
      'file_name', d.file_name,
      'file_size', d.file_size,
      'file_type', d.file_type,
      'version', d.version,
      'created_at', d.created_at,
      'updated_at', d.updated_at,
      'created_by', d.created_by,
      'updated_by', d.updated_by,
      -- The flat, derived, camelCase field for the label
      'documentTypeTranslations', dt.translations
    )
  ) INTO id_documents_data
  FROM patient_id_documents d
  LEFT JOIN document_types dt ON d.document_type = dt.id
  WHERE d.patient_id = p_patient_id;

  -- =================================================================
  -- Get insurance policies for the patient --
  -- =================================================================
  SELECT json_agg(
    json_build_object(
      'id', pi.id,
      'patient_id', pi.patient_id,
      'plan_id', pi.plan_id,
      'policy_number', pi.policy_number,
      'lbo_number', pi.lbo_number,
      'is_active', pi.is_active,
      'effective_date', pi.effective_date,
      'expiry_date', pi.expiry_date,
      'file_path', pi.file_path,
      'file_name', pi.file_name,
      'file_size', pi.file_size,
      'file_type', pi.file_type,
      'version', pi.version,
      'created_at', pi.created_at,
      'updated_at', pi.updated_at,
      'created_by', pi.created_by,
      'updated_by', pi.updated_by,
      -- Nested plan and provider details
      'plan', json_build_object(
        'id', ip.id,
        'provider_id', ip.provider_id,
        'name_translations', ip.name_translations,
        'description_translations', ip.description_translations,
        'coverage_details', ip.coverage_details,
        'provider', json_build_object(
          'id', ipv.id,
          'name_translations', ipv.name_translations,
          'contact_info', ipv.contact_info
        )
      )
    )
  ) INTO insurances_data
  FROM patient_insurances pi
  LEFT JOIN insurance_plans ip ON pi.plan_id = ip.id
  LEFT JOIN insurance_providers ipv ON ip.provider_id = ipv.id
  WHERE pi.patient_id = p_patient_id;

  -- =================================================================
  -- Get personal data --
  -- =================================================================
  SELECT json_build_object(
  -- ... existing fields ...
  'id', pp.id,
  'patient_id', pp.patient_id,
  'created_at', pp.created_at,
  'updated_at', pp.updated_at,
  'created_by', pp.created_by,
  'updated_by', pp.updated_by,
  'version', pp.version,
  'parent_name', pp.parent_name,
  'marital_status', pp.marital_status,
  'profession_id', pp.profession_id,
  'education_level', pp.education_level,
  'employer_id', pp.employer_id,  -- Changed from employer_name
  'employment_status', pp.employment_status,
  'living_arrangement', pp.living_arrangement,
  'birth_country_id', pp.birth_country_id,
  'birth_city_id', pp.birth_city_id,

  -- Derived camelCase fields
  'birthCountryIso2', bc.iso2,
  'birthCity', CASE WHEN bci.id IS NOT NULL THEN json_build_object(
    'id', bci.id,
    'name', bci.name,
    'postal_code', bci.postal_code
  ) ELSE NULL END,
  'profession', CASE WHEN prof.id IS NOT NULL THEN json_build_object(
    'id', prof.id,
    'name_translations', prof.name_translations
  ) ELSE NULL END,
  -- Add employer object
  'employer', CASE WHEN emp.id IS NOT NULL THEN json_build_object(
    'id', emp.id,
    'name', emp.name
  ) ELSE NULL END
) INTO personal_data
FROM patient_personal pp
LEFT JOIN countries bc ON pp.birth_country_id = bc.id
LEFT JOIN cities bci ON pp.birth_city_id = bci.id
LEFT JOIN professions prof ON pp.profession_id = prof.id
LEFT JOIN companies emp ON pp.employer_id = emp.id  -- Add this JOIN
WHERE pp.patient_id = p_patient_id;

  -- =================================================================
  -- Get risk data
  -- =================================================================
  SELECT row_to_json(rv) INTO risk_data
  FROM patient_risk_view rv
  WHERE rv.patient_id = p_patient_id;

  -- =================================================================
  -- Get patient notes --
  -- =================================================================
  SELECT json_agg(n) INTO notes_data
  FROM patient_notes n
  WHERE n.patient_id = p_patient_id;

  -- Combine everything into a single JSON object
  RETURN json_build_object(
    'general', general_data,
    'personal', personal_data,
    'risk', risk_data,
    'notes', notes_data,
    'id_documents', id_documents_data,
    'insurances', insurances_data
  );
END;
$$;
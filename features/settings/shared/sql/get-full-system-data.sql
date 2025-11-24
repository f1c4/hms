CREATE OR REPLACE FUNCTION get_full_system_data()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  insurance_data JSON;
  medical_document_types_data JSON;
BEGIN
  -- =================================================================
  -- Get full insurance data (providers and their plans)
  -- =================================================================
  SELECT COALESCE(json_agg(providers), '[]'::json)
  INTO insurance_data
  FROM (
    SELECT
      p.id,
      p.name_translations,
      p.contact_info,
      (
        SELECT COALESCE(json_agg(plans), '[]'::json)
        FROM (
          SELECT
            pl.id,
            pl.name_translations,
            pl.description_translations
          FROM insurance_plans pl
          WHERE pl.provider_id = p.id
        ) AS plans
      ) AS plans
    FROM insurance_providers p
  ) AS providers;

  -- =================================================================
  -- Get all medical document types
  -- =================================================================
  SELECT COALESCE(json_agg(types), '[]'::json)
  INTO medical_document_types_data
  FROM (
    SELECT
      mdt.id,
      mdt.type_key,
      mdt.name_translations
    FROM medical_document_types mdt
    ORDER BY mdt.id
  ) AS types;

  -- =================================================================
  -- Combine everything into a single JSON object
  -- =================================================================
  RETURN json_build_object(
    'insurance_data', insurance_data,
    'medical_document_types', medical_document_types_data
  );
END;
$$;
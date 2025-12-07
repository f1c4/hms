CREATE OR REPLACE FUNCTION get_patient_list_basic(
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0,
  p_first_name TEXT DEFAULT NULL,
  p_last_name TEXT DEFAULT NULL,
  p_national_id TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_sort TEXT DEFAULT 'created_at',
  p_order TEXT DEFAULT 'desc'
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_count BIGINT;
  v_filtered_count BIGINT;
  v_data JSONB;
  v_is_asc BOOLEAN;
BEGIN
  -- Determine sort direction
  v_is_asc := LOWER(p_order) = 'asc';

  -- Get total count (unfiltered)
  SELECT COUNT(*) INTO v_total_count FROM patient_general;

  -- Get filtered count
  SELECT COUNT(*) INTO v_filtered_count
  FROM patient_general
  WHERE 
    (p_first_name IS NULL OR p_first_name = '' OR first_name ILIKE '%' || p_first_name || '%')
    AND (p_last_name IS NULL OR p_last_name = '' OR last_name ILIKE '%' || p_last_name || '%')
    AND (p_national_id IS NULL OR p_national_id = '' OR national_id_number ILIKE '%' || p_national_id || '%')
    AND (p_phone IS NULL OR p_phone = '' OR phone ILIKE '%' || p_phone || '%');

  -- Get paginated data
  SELECT COALESCE(jsonb_agg(row_data), '[]'::jsonb)
  INTO v_data
  FROM (
    SELECT jsonb_build_object(
      'id', pg.id,
      'firstName', pg.first_name,
      'lastName', pg.last_name,
      'nationalIdNumber', pg.national_id_number,
      'dateOfBirth', pg.date_of_birth,
      'phone', pg.phone,
      'email', pg.email,
      'residenceAddress', pg.residence_address,
      'emergencyContactName', pg.emergency_contact_name,
      'emergencyContactPhone', pg.emergency_contact_phone,
      'emergencyContactRelation', pg.emergency_contact_relation,
      'createdAt', pg.created_at,
      'updatedAt', pg.updated_at
    ) AS row_data
    FROM patient_general pg
    WHERE 
      (p_first_name IS NULL OR p_first_name = '' OR pg.first_name ILIKE '%' || p_first_name || '%')
      AND (p_last_name IS NULL OR p_last_name = '' OR pg.last_name ILIKE '%' || p_last_name || '%')
      AND (p_national_id IS NULL OR p_national_id = '' OR pg.national_id_number ILIKE '%' || p_national_id || '%')
      AND (p_phone IS NULL OR p_phone = '' OR pg.phone ILIKE '%' || p_phone || '%')
    ORDER BY
      CASE WHEN p_sort = 'created_at' AND v_is_asc THEN pg.created_at END ASC NULLS LAST,
      CASE WHEN p_sort = 'created_at' AND NOT v_is_asc THEN pg.created_at END DESC NULLS LAST,
      CASE WHEN p_sort = 'first_name' AND v_is_asc THEN pg.first_name END ASC NULLS LAST,
      CASE WHEN p_sort = 'first_name' AND NOT v_is_asc THEN pg.first_name END DESC NULLS LAST,
      CASE WHEN p_sort = 'last_name' AND v_is_asc THEN pg.last_name END ASC NULLS LAST,
      CASE WHEN p_sort = 'last_name' AND NOT v_is_asc THEN pg.last_name END DESC NULLS LAST,
      CASE WHEN p_sort = 'date_of_birth' AND v_is_asc THEN pg.date_of_birth END ASC NULLS LAST,
      CASE WHEN p_sort = 'date_of_birth' AND NOT v_is_asc THEN pg.date_of_birth END DESC NULLS LAST,
      CASE WHEN p_sort = 'national_id_number' AND v_is_asc THEN pg.national_id_number END ASC NULLS LAST,
      CASE WHEN p_sort = 'national_id_number' AND NOT v_is_asc THEN pg.national_id_number END DESC NULLS LAST
    LIMIT p_limit
    OFFSET p_offset
  ) subquery;

  -- Return result
  RETURN jsonb_build_object(
    'data', v_data,
    'filteredCount', v_filtered_count,
    'totalCount', v_total_count,
    'pagination', jsonb_build_object(
      'page', (p_offset / p_limit) + 1,
      'limit', p_limit,
      'totalPages', CEIL(v_filtered_count::DECIMAL / p_limit)
    )
  );
END;
$$;

COMMENT ON FUNCTION get_patient_list_basic IS 'Basic patient search by name, national ID, and phone. Use get_patient_list_advanced for searching across related tables.';
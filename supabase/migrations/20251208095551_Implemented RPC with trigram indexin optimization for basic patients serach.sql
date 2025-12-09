create extension if not exists "pg_trgm" with schema "public";

CREATE INDEX idx_patient_general_created_at ON public.patient_general USING btree (created_at DESC);

CREATE INDEX idx_patient_general_first_name_btree ON public.patient_general USING btree (first_name);

CREATE INDEX idx_patient_general_first_name_trgm ON public.patient_general USING gin (first_name public.gin_trgm_ops);

CREATE INDEX idx_patient_general_last_name_btree ON public.patient_general USING btree (last_name);

CREATE INDEX idx_patient_general_last_name_trgm ON public.patient_general USING gin (last_name public.gin_trgm_ops);

CREATE INDEX idx_patient_general_national_id_trgm ON public.patient_general USING gin (national_id_number public.gin_trgm_ops);

CREATE INDEX idx_patient_general_phone_trgm ON public.patient_general USING gin (phone public.gin_trgm_ops);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_patient_list_basic(p_limit integer DEFAULT 20, p_offset integer DEFAULT 0, p_first_name text DEFAULT NULL::text, p_last_name text DEFAULT NULL::text, p_national_id text DEFAULT NULL::text, p_phone text DEFAULT NULL::text, p_sort text DEFAULT 'created_at'::text, p_order text DEFAULT 'desc'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;



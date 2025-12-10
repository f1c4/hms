drop function if exists "public"."get_patient_list_basic"(p_limit integer, p_offset integer, p_first_name text, p_last_name text, p_national_id text, p_phone text, p_sort text, p_order text);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_patient_list_basic(p_limit integer DEFAULT 20, p_offset integer DEFAULT 0, p_first_name text DEFAULT NULL::text, p_last_name text DEFAULT NULL::text, p_national_id text DEFAULT NULL::text, p_phone text DEFAULT NULL::text, p_sort text DEFAULT 'created_at'::text, p_order text DEFAULT 'desc'::text, p_min_chars integer DEFAULT 2)
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
  v_has_filters BOOLEAN;
  v_first_name TEXT;
  v_last_name TEXT;
  v_national_id TEXT;
  v_phone TEXT;
BEGIN
  v_is_asc := LOWER(p_order) = 'asc';

  -- Normalize filters: treat as NULL if empty or below minimum character threshold
  v_first_name := CASE 
    WHEN p_first_name IS NOT NULL AND LENGTH(TRIM(p_first_name)) >= p_min_chars 
    THEN TRIM(p_first_name) 
    ELSE NULL 
  END;
  
  v_last_name := CASE 
    WHEN p_last_name IS NOT NULL AND LENGTH(TRIM(p_last_name)) >= p_min_chars 
    THEN TRIM(p_last_name) 
    ELSE NULL 
  END;
  
  v_national_id := CASE 
    WHEN p_national_id IS NOT NULL AND LENGTH(TRIM(p_national_id)) >= p_min_chars 
    THEN TRIM(p_national_id) 
    ELSE NULL 
  END;
  
  v_phone := CASE 
    WHEN p_phone IS NOT NULL AND LENGTH(TRIM(p_phone)) >= p_min_chars 
    THEN TRIM(p_phone) 
    ELSE NULL 
  END;

  v_has_filters := v_first_name IS NOT NULL 
                OR v_last_name IS NOT NULL 
                OR v_national_id IS NOT NULL 
                OR v_phone IS NOT NULL;

  -- Fast approximate count for total (O(1) lookup)
  SELECT COALESCE(reltuples::BIGINT, 0) 
  INTO v_total_count 
  FROM pg_class 
  WHERE relname = 'patient_general' AND relnamespace = 'public'::regnamespace;

  IF NOT v_has_filters THEN
    v_filtered_count := v_total_count;
  ELSE
    SELECT COUNT(*) INTO v_filtered_count
    FROM patient_general
    WHERE 
      (v_first_name IS NULL OR first_name ILIKE '%' || v_first_name || '%')
      AND (v_last_name IS NULL OR last_name ILIKE '%' || v_last_name || '%')
      AND (v_national_id IS NULL OR national_id_number ILIKE '%' || v_national_id || '%')
      AND (v_phone IS NULL OR phone ILIKE '%' || v_phone || '%');
  END IF;

  SELECT COALESCE(jsonb_agg(row_data), '[]'::jsonb)
  INTO v_data
  FROM (
    SELECT 
      jsonb_build_object(
        'id', pg.id,
        'firstName', pg.first_name,
        'lastName', pg.last_name,
        'nationalIdNumber', pg.national_id_number,
        'dateOfBirth', pg.date_of_birth,
        'phone', pg.phone,
        'email', pg.email,
        'residenceAddress', pg.residence_address,
        'residenceCountryIso2', c.iso2,
        'residenceCityName', ci.name,
        'residenceCityPostalCode', ci.postal_code,
        'emergencyContactName', pg.emergency_contact_name,
        'emergencyContactPhone', pg.emergency_contact_phone,
        'emergencyContactRelation', pg.emergency_contact_relation,
        'createdAt', pg.created_at,
        'updatedAt', pg.updated_at
      ) AS row_data
    FROM patient_general pg
    LEFT JOIN countries c ON pg.residence_country_id = c.id
    LEFT JOIN cities ci ON pg.residence_city_id = ci.id
    WHERE 
      (v_first_name IS NULL OR pg.first_name ILIKE '%' || v_first_name || '%')
      AND (v_last_name IS NULL OR pg.last_name ILIKE '%' || v_last_name || '%')
      AND (v_national_id IS NULL OR pg.national_id_number ILIKE '%' || v_national_id || '%')
      AND (v_phone IS NULL OR pg.phone ILIKE '%' || v_phone || '%')
    ORDER BY
      CASE WHEN p_sort = 'created_at' AND v_is_asc THEN pg.created_at END ASC NULLS LAST,
      CASE WHEN p_sort = 'created_at' AND NOT v_is_asc THEN pg.created_at END DESC NULLS LAST,
      CASE WHEN p_sort = 'first_name' AND v_is_asc THEN pg.first_name END ASC NULLS LAST,
      CASE WHEN p_sort = 'first_name' AND NOT v_is_asc THEN pg.first_name END DESC NULLS LAST,
      CASE WHEN p_sort = 'last_name' AND v_is_asc THEN pg.last_name END ASC NULLS LAST,
      CASE WHEN p_sort = 'last_name' AND NOT v_is_asc THEN pg.last_name END DESC NULLS LAST,
      CASE WHEN p_sort = 'date_of_birth' AND v_is_asc THEN pg.date_of_birth END ASC NULLS LAST,
      CASE WHEN p_sort = 'date_of_birth' AND NOT v_is_asc THEN pg.date_of_birth END DESC NULLS LAST
    LIMIT p_limit
    OFFSET p_offset
  ) subquery;

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



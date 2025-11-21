


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."get_full_patient_data"("p_patient_id" integer) RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
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
    -- Include all original snake_case columns
    'id', pp.id,
    'patient_id', pp.patient_id,
    'created_at', pp.created_at,
    'updated_at', pp.updated_at,
    'created_by', pp.created_by,
    'updated_by', pp.updated_by,
    'version', pp.version,
    'parent_name', pp.parent_name,
    'marital_status', pp.marital_status,
    'profession', pp.profession,
    'education_level', pp.education_level,
    'employer_name', pp.employer_name,
    'employment_status', pp.employment_status,
    'living_arrangement', pp.living_arrangement,
    'birth_country_id', pp.birth_country_id,
    'birth_city_id', pp.birth_city_id,

    -- Add the new derived camelCase fields
    'birthCountryIso2', bc.iso2,
    'birthCity', CASE WHEN bci.id IS NOT NULL THEN json_build_object(
      'id', bci.id,
      'name', bci.name,
      'postal_code', bci.postal_code
    ) ELSE NULL END
  ) INTO personal_data
  FROM patient_personal pp
  LEFT JOIN countries bc ON pp.birth_country_id = bc.id
  LEFT JOIN cities bci ON pp.birth_city_id = bci.id
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


ALTER FUNCTION "public"."get_full_patient_data"("p_patient_id" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_full_system_data"() RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."get_full_system_data"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_patient_medical_history"("p_patient_id" bigint) RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."get_patient_medical_history"("p_patient_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."ambulances" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_by" "uuid",
    "name" character varying NOT NULL,
    "address" character varying,
    "company_id" bigint,
    "description" character varying,
    "email" character varying,
    "lat" numeric,
    "lng" numeric,
    "phone" character varying
);


ALTER TABLE "public"."ambulances" OWNER TO "postgres";


ALTER TABLE "public"."ambulances" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."ambulances_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."cities" (
    "id" bigint NOT NULL,
    "name" "text" NOT NULL,
    "postal_code" "text" NOT NULL,
    "country_id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."cities" OWNER TO "postgres";


ALTER TABLE "public"."cities" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."cities_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."companies" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_by" "uuid",
    "name" character varying NOT NULL,
    "register_num" bigint NOT NULL
);


ALTER TABLE "public"."companies" OWNER TO "postgres";


ALTER TABLE "public"."companies" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."companies_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."company_info" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_by" "uuid",
    "name" character varying,
    "tin" character varying,
    "vat" character varying,
    "address" character varying,
    "phone" character varying,
    "email" character varying,
    "description" character varying,
    "website" character varying
);


ALTER TABLE "public"."company_info" OWNER TO "postgres";


ALTER TABLE "public"."company_info" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."company_info_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."countries" (
    "id" smallint NOT NULL,
    "name" "text" NOT NULL,
    "iso2" character(2) NOT NULL
);


ALTER TABLE "public"."countries" OWNER TO "postgres";


ALTER TABLE "public"."countries" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."countries_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."document_types" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "created_by" "uuid",
    "updated_by" "uuid",
    "entity" "text" NOT NULL,
    "translations" "jsonb" NOT NULL
);


ALTER TABLE "public"."document_types" OWNER TO "postgres";


ALTER TABLE "public"."document_types" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."document_types_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."drug_register_me" (
    "id" bigint NOT NULL,
    "atc" character varying,
    "inn" character varying,
    "drug_name" character varying,
    "description" "text",
    "regime" character varying,
    "license_number" character varying,
    "license_date" "date",
    "producer" character varying,
    "license_holder" character varying
);


ALTER TABLE "public"."drug_register_me" OWNER TO "postgres";


ALTER TABLE "public"."drug_register_me" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."drug_register_me_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."drug_register_sr" (
    "id" bigint NOT NULL,
    "jkl" character varying,
    "atc" character varying,
    "inn" character varying,
    "drug_name" character varying,
    "fo" character varying,
    "drug_package" character varying,
    "producer" character varying,
    "origin_country" character varying,
    "participation" character varying,
    "indications" character varying,
    "note" character varying,
    "regime" character varying
);


ALTER TABLE "public"."drug_register_sr" OWNER TO "postgres";


ALTER TABLE "public"."drug_register_sr" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."drug_register_sr_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."employee_documents" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp without time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_by" "uuid",
    "file_path" "text",
    "document_type" bigint,
    "file_name" "text",
    "file_size" numeric,
    "description" "text"
);


ALTER TABLE "public"."employee_documents" OWNER TO "postgres";


ALTER TABLE "public"."employee_documents" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."employee_documents_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."employee_type" (
    "id" bigint NOT NULL,
    "value" character varying NOT NULL,
    "label" character varying NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid",
    "updated_by" "uuid"
);


ALTER TABLE "public"."employee_type" OWNER TO "postgres";


ALTER TABLE "public"."employee_type" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."employee_type_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."employees" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "updated_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "image" character varying DEFAULT ''::character varying,
    "email" character varying,
    "phone" character varying,
    "vocation" bigint,
    "address" character varying,
    "auth_id" "uuid",
    "contract_from" "date",
    "contract_to" "date",
    "name" character varying,
    "document_id" character varying,
    "birth_date" "date",
    "role" character varying
);


ALTER TABLE "public"."employees" OWNER TO "postgres";


ALTER TABLE "public"."employees" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."employees_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."exam_status" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_by" "uuid",
    "value" character varying,
    "label" character varying
);


ALTER TABLE "public"."exam_status" OWNER TO "postgres";


ALTER TABLE "public"."exam_status" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."exam_status_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."exam_types" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_by" "uuid",
    "value" character varying NOT NULL,
    "label" character varying,
    "time" bigint NOT NULL,
    "price" numeric
);


ALTER TABLE "public"."exam_types" OWNER TO "postgres";


ALTER TABLE "public"."exam_types" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."exam_types_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."exams" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "updated_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "patient" bigint NOT NULL,
    "employee" bigint,
    "info" bigint,
    "status" character varying,
    "exam_type" bigint,
    "scheduled" timestamp with time zone
);


ALTER TABLE "public"."exams" OWNER TO "postgres";


ALTER TABLE "public"."exams" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."exams_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."insurance_plans" (
    "id" bigint NOT NULL,
    "provider_id" bigint NOT NULL,
    "name_translations" "jsonb" NOT NULL,
    "description_translations" "jsonb",
    "coverage_details" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."insurance_plans" OWNER TO "postgres";


ALTER TABLE "public"."insurance_plans" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."insurance_plans_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."insurance_providers" (
    "id" bigint NOT NULL,
    "name_translations" "jsonb" NOT NULL,
    "contact_info" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."insurance_providers" OWNER TO "postgres";


ALTER TABLE "public"."insurance_providers" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."insurance_providers_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."invoices" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_by" "uuid",
    "patient_id" bigint,
    "emplyee_id" bigint,
    "date" "date"
);


ALTER TABLE "public"."invoices" OWNER TO "postgres";


ALTER TABLE "public"."invoices" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."invoices_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."join_ambulace_exam_type" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid",
    "abulance_id" bigint,
    "exam_type_id" bigint
);


ALTER TABLE "public"."join_ambulace_exam_type" OWNER TO "postgres";


ALTER TABLE "public"."join_ambulace_exam_type" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."join_ambulace_exam_type_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."join_employee_exam" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_by" "uuid",
    "employee_id" bigint,
    "exam_id" bigint
);


ALTER TABLE "public"."join_employee_exam" OWNER TO "postgres";


ALTER TABLE "public"."join_employee_exam" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."join_employee_exam_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."join_patient_services" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "invoice_id" bigint,
    "service_id" bigint,
    "patient_id" bigint
);


ALTER TABLE "public"."join_patient_services" OWNER TO "postgres";


ALTER TABLE "public"."join_patient_services" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."join_patient_services_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."medical_document_types" (
    "id" bigint NOT NULL,
    "type_key" "text" NOT NULL,
    "name_translations" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."medical_document_types" OWNER TO "postgres";


COMMENT ON TABLE "public"."medical_document_types" IS 'Master list of medical document types (e.g., lab analysis, discharge list).';



COMMENT ON COLUMN "public"."medical_document_types"."type_key" IS 'A unique, machine-readable key for the document type.';



COMMENT ON COLUMN "public"."medical_document_types"."name_translations" IS 'JSONB object with translations for the document type name.';



ALTER TABLE "public"."medical_document_types" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."medical_document_types_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."mkb_10" (
    "id" bigint NOT NULL,
    "code" character varying(10) NOT NULL,
    "diagnosis_translations" "jsonb",
    "diagnosis_la" "text"
);


ALTER TABLE "public"."mkb_10" OWNER TO "postgres";


COMMENT ON TABLE "public"."mkb_10" IS 'International Classification of Diseases, 10th Revision, with multilingual translations in a JSONB column.';



COMMENT ON COLUMN "public"."mkb_10"."code" IS 'The official MKB-10 code (e.g., A01.0).';



COMMENT ON COLUMN "public"."mkb_10"."diagnosis_translations" IS 'JSONB object containing translations, e.g., {"en": "Typhoid fever", "sr-Latn": "Tifusna groznica"}.';



ALTER TABLE "public"."mkb_10" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."mkb_10_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."patient_general" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "created_by" "uuid" NOT NULL,
    "updated_by" "uuid",
    "email" "text",
    "phone" "text",
    "first_name" "text" NOT NULL,
    "last_name" "text" NOT NULL,
    "date_of_birth" "date" NOT NULL,
    "emergency_contact_name" "text",
    "emergency_contact_phone" "text",
    "emergency_contact_relation" "text",
    "patient_user_id" "uuid",
    "version" integer DEFAULT 1 NOT NULL,
    "citizenship_country_id" smallint,
    "national_id_number" "text",
    "residence_address" "text",
    "residence_city_id" bigint,
    "residence_country_id" smallint
);


ALTER TABLE "public"."patient_general" OWNER TO "postgres";


ALTER TABLE "public"."patient_general" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."patient_general_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."patient_id_documents" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "created_by" "uuid" NOT NULL,
    "updated_by" "uuid",
    "file_path" "text",
    "file_name" "text",
    "file_size" numeric,
    "file_type" "text",
    "document_number" "text" NOT NULL,
    "document_type" bigint NOT NULL,
    "patient_id" bigint NOT NULL,
    "version" integer DEFAULT 1 NOT NULL,
    "expiry_date" "date" NOT NULL,
    "issue_date" "date" NOT NULL
);


ALTER TABLE "public"."patient_id_documents" OWNER TO "postgres";


ALTER TABLE "public"."patient_id_documents" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."patient_id_documents_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."patient_insurances" (
    "id" bigint NOT NULL,
    "patient_id" integer NOT NULL,
    "plan_id" bigint NOT NULL,
    "policy_number" "text" NOT NULL,
    "lbo_number" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "effective_date" "date" NOT NULL,
    "expiry_date" "date",
    "file_path" "text",
    "file_name" "text",
    "file_size" numeric,
    "file_type" "text",
    "created_by" "uuid" NOT NULL,
    "updated_by" "uuid",
    "version" integer DEFAULT 1 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."patient_insurances" OWNER TO "postgres";


ALTER TABLE "public"."patient_insurances" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."patient_insurances_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."patient_medical_document_diagnoses" (
    "document_id" bigint NOT NULL,
    "diagnosis_code" "text" NOT NULL
);


ALTER TABLE "public"."patient_medical_document_diagnoses" OWNER TO "postgres";


COMMENT ON TABLE "public"."patient_medical_document_diagnoses" IS 'Links medical documents to specific MKB-10 diagnoses.';



CREATE TABLE IF NOT EXISTS "public"."patient_medical_documents" (
    "id" bigint NOT NULL,
    "event_id" bigint NOT NULL,
    "document_type_id" bigint NOT NULL,
    "document_date" "date" NOT NULL,
    "notes" "jsonb",
    "file_path" "text",
    "file_name" "text",
    "ai_source_locale" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "created_by" "uuid" NOT NULL,
    "updated_by" "uuid",
    "file_size" numeric,
    "file_type" "text",
    "version" integer DEFAULT 1 NOT NULL
);


ALTER TABLE "public"."patient_medical_documents" OWNER TO "postgres";


COMMENT ON TABLE "public"."patient_medical_documents" IS 'Stores individual historical medical documents, grouped by a medical event.';



COMMENT ON COLUMN "public"."patient_medical_documents"."event_id" IS 'Links the document to a specific medical history event.';



COMMENT ON COLUMN "public"."patient_medical_documents"."notes" IS 'Translatable summary or notes about the document.';



COMMENT ON COLUMN "public"."patient_medical_documents"."ai_source_locale" IS 'The source locale of the original text for AI translation.';



ALTER TABLE "public"."patient_medical_documents" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."patient_medical_documents_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."patient_medical_history_event_diagnoses" (
    "event_id" bigint NOT NULL,
    "diagnosis_code" character varying(10) NOT NULL
);


ALTER TABLE "public"."patient_medical_history_event_diagnoses" OWNER TO "postgres";


COMMENT ON TABLE "public"."patient_medical_history_event_diagnoses" IS 'Links medical history events to specific MKB-10 diagnoses.';



CREATE TABLE IF NOT EXISTS "public"."patient_medical_history_events" (
    "id" bigint NOT NULL,
    "patient_id" bigint NOT NULL,
    "title" "jsonb" NOT NULL,
    "event_date" "date" NOT NULL,
    "notes" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "created_by" "uuid" NOT NULL,
    "updated_by" "uuid",
    "version" integer DEFAULT 1 NOT NULL,
    "ai_source_locale" "text" NOT NULL
);


ALTER TABLE "public"."patient_medical_history_events" OWNER TO "postgres";


COMMENT ON TABLE "public"."patient_medical_history_events" IS 'Acts as a container/folder for a specific medical event (e.g., a hospital stay).';



COMMENT ON COLUMN "public"."patient_medical_history_events"."title" IS 'Translatable title of the event (e.g., "Cardiology Consultation").';



COMMENT ON COLUMN "public"."patient_medical_history_events"."event_date" IS 'The primary date associated with the event.';



ALTER TABLE "public"."patient_medical_history_events" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."patient_medical_history_events_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."patient_notes" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid",
    "updated_at" timestamp with time zone,
    "updated_by" "uuid",
    "patient_id" bigint,
    "note" "text",
    "version" integer DEFAULT 1 NOT NULL
);


ALTER TABLE "public"."patient_notes" OWNER TO "postgres";


ALTER TABLE "public"."patient_notes" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."patient_notes_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."patient_personal" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "created_by" "uuid" NOT NULL,
    "updated_by" "uuid",
    "marital_status" "text",
    "profession" "text",
    "patient_id" bigint NOT NULL,
    "parent_name" "text",
    "version" integer DEFAULT 1 NOT NULL,
    "education_level" "text",
    "employer_name" "text",
    "employment_status" "text",
    "living_arrangement" "text",
    "birth_city_id" bigint,
    "birth_country_id" smallint
);


ALTER TABLE "public"."patient_personal" OWNER TO "postgres";


ALTER TABLE "public"."patient_personal" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."patient_personal_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."patient_risk" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "created_by" "uuid" NOT NULL,
    "updated_by" "uuid",
    "gender" "text",
    "weight" numeric,
    "height" numeric,
    "patient_id" bigint NOT NULL,
    "waist_circumference" numeric,
    "version" integer DEFAULT 1 NOT NULL,
    "alcohol_consumption" "text",
    "physical_activity_level" "text",
    "smoking_status" "text",
    "stress_level" "text",
    "blood_type" "text"
);


ALTER TABLE "public"."patient_risk" OWNER TO "postgres";


ALTER TABLE "public"."patient_risk" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."patient_risk_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE OR REPLACE VIEW "public"."patient_risk_view" AS
 SELECT "pr"."id",
    "pr"."patient_id",
    "pr"."created_at",
    "pr"."updated_at",
    "pr"."created_by",
    "pr"."updated_by",
    "pr"."gender",
    "pr"."blood_type",
    "pr"."weight",
    "pr"."height",
    "pr"."waist_circumference",
    "pr"."smoking_status",
    "pr"."alcohol_consumption",
    "pr"."physical_activity_level",
    "pr"."stress_level",
    "pr"."version",
    (EXTRACT(year FROM "age"(("pg"."date_of_birth")::timestamp with time zone)))::integer AS "age",
        CASE
            WHEN (("pr"."height" > (0)::numeric) AND ("pr"."weight" > (0)::numeric)) THEN "round"(("pr"."weight" / (("pr"."height" / (100)::numeric) * ("pr"."height" / (100)::numeric))), 2)
            ELSE NULL::numeric
        END AS "bmi",
        CASE
            WHEN (("pr"."height" > (0)::numeric) AND ("pr"."weight" > (0)::numeric)) THEN
            CASE
                WHEN (("pr"."weight" / (("pr"."height" / (100)::numeric) * ("pr"."height" / (100)::numeric))) < 18.5) THEN 'UNDERWEIGHT'::"text"
                WHEN ((("pr"."weight" / (("pr"."height" / (100)::numeric) * ("pr"."height" / (100)::numeric))) >= 18.5) AND (("pr"."weight" / (("pr"."height" / (100)::numeric) * ("pr"."height" / (100)::numeric))) <= 24.9)) THEN 'NORMAL'::"text"
                WHEN ((("pr"."weight" / (("pr"."height" / (100)::numeric) * ("pr"."height" / (100)::numeric))) >= 25.0) AND (("pr"."weight" / (("pr"."height" / (100)::numeric) * ("pr"."height" / (100)::numeric))) <= 29.9)) THEN 'OVERWEIGHT'::"text"
                WHEN (("pr"."weight" / (("pr"."height" / (100)::numeric) * ("pr"."height" / (100)::numeric))) >= 30.0) THEN 'OBESE'::"text"
                ELSE NULL::"text"
            END
            ELSE NULL::"text"
        END AS "obesity_status"
   FROM ("public"."patient_risk" "pr"
     JOIN "public"."patient_general" "pg" ON (("pr"."patient_id" = "pg"."id")));


ALTER VIEW "public"."patient_risk_view" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profession_type" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_by" "uuid",
    "value" character varying,
    "label" character varying
);


ALTER TABLE "public"."profession_type" OWNER TO "postgres";


ALTER TABLE "public"."profession_type" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."profession_type_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."referrals" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_by" "uuid",
    "patient_id" bigint,
    "employe_id" bigint,
    "report_id" bigint,
    "time" timestamp with time zone,
    "type" character varying,
    "institution" character varying,
    "med_history" "text"
);


ALTER TABLE "public"."referrals" OWNER TO "postgres";


ALTER TABLE "public"."referrals" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."referrals_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."reports" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_by" "uuid",
    "date" timestamp with time zone,
    "patient_id" bigint,
    "exam_type" bigint,
    "anamnesis" "text",
    "objective_finding" "text",
    "other_finding" "text",
    "mkb10_id" character varying,
    "diagnosis" "text",
    "conclusion" "text"
);


ALTER TABLE "public"."reports" OWNER TO "postgres";


ALTER TABLE "public"."reports" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."reports_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."services" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_by" "uuid",
    "value" character varying,
    "label" character varying,
    "price" bigint
);


ALTER TABLE "public"."services" OWNER TO "postgres";


ALTER TABLE "public"."services" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."services_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."sessions" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "user_id" "uuid",
    "device_id" "text"
);


ALTER TABLE "public"."sessions" OWNER TO "postgres";


ALTER TABLE "public"."sessions" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."sessions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "public"."employee_type"
    ADD CONSTRAINT "add_emplyee_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ambulances"
    ADD CONSTRAINT "ambulances_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."ambulances"
    ADD CONSTRAINT "ambulances_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cities"
    ADD CONSTRAINT "cities_name_country_id_key" UNIQUE ("name", "country_id");



ALTER TABLE ONLY "public"."cities"
    ADD CONSTRAINT "cities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_register_num_key" UNIQUE ("register_num");



ALTER TABLE ONLY "public"."company_info"
    ADD CONSTRAINT "company_info_pdv_key" UNIQUE ("vat");



ALTER TABLE ONLY "public"."company_info"
    ADD CONSTRAINT "company_info_pib_key" UNIQUE ("tin");



ALTER TABLE ONLY "public"."company_info"
    ADD CONSTRAINT "company_info_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."countries"
    ADD CONSTRAINT "countries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."document_types"
    ADD CONSTRAINT "document_type_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."drug_register_me"
    ADD CONSTRAINT "drug_register_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."drug_register_sr"
    ADD CONSTRAINT "drug_register_sr_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."employee_documents"
    ADD CONSTRAINT "employee_documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."employee_type"
    ADD CONSTRAINT "employee_type_value_key" UNIQUE ("value");



ALTER TABLE ONLY "public"."employees"
    ADD CONSTRAINT "employees_document_id_key" UNIQUE ("document_id");



ALTER TABLE ONLY "public"."employees"
    ADD CONSTRAINT "employees_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."exam_status"
    ADD CONSTRAINT "exam_status_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."exam_status"
    ADD CONSTRAINT "exam_status_value_key" UNIQUE ("value");



ALTER TABLE ONLY "public"."exam_types"
    ADD CONSTRAINT "exam_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."exam_types"
    ADD CONSTRAINT "exam_types_value_key" UNIQUE ("value");



ALTER TABLE ONLY "public"."exams"
    ADD CONSTRAINT "exams_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."insurance_plans"
    ADD CONSTRAINT "insurance_plans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."insurance_providers"
    ADD CONSTRAINT "insurance_providers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."join_ambulace_exam_type"
    ADD CONSTRAINT "juncion_ambulace_exam_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."join_employee_exam"
    ADD CONSTRAINT "junction_employee_exam_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."join_patient_services"
    ADD CONSTRAINT "junction_patient_services_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."medical_document_types"
    ADD CONSTRAINT "medical_document_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."medical_document_types"
    ADD CONSTRAINT "medical_document_types_type_key_key" UNIQUE ("type_key");



ALTER TABLE ONLY "public"."patient_medical_history_events"
    ADD CONSTRAINT "medical_history_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mkb_10"
    ADD CONSTRAINT "mkb_10_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."mkb_10"
    ADD CONSTRAINT "mkb_10_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."patient_general"
    ADD CONSTRAINT "patient_general_umcn_key" UNIQUE ("national_id_number");



ALTER TABLE ONLY "public"."patient_id_documents"
    ADD CONSTRAINT "patient_id_documents_patient_id_document_type_key" UNIQUE ("patient_id", "document_type");



ALTER TABLE ONLY "public"."patient_id_documents"
    ADD CONSTRAINT "patient_id_documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."patient_insurances"
    ADD CONSTRAINT "patient_insurances_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."patient_medical_document_diagnoses"
    ADD CONSTRAINT "patient_medical_document_diagnoses_pkey" PRIMARY KEY ("document_id", "diagnosis_code");



ALTER TABLE ONLY "public"."patient_medical_documents"
    ADD CONSTRAINT "patient_medical_documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."patient_medical_history_event_diagnoses"
    ADD CONSTRAINT "patient_medical_history_event_diagnoses_pkey" PRIMARY KEY ("event_id", "diagnosis_code");



ALTER TABLE ONLY "public"."patient_notes"
    ADD CONSTRAINT "patient_notes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."patient_personal"
    ADD CONSTRAINT "patient_personal_patient_id_key" UNIQUE ("patient_id");



ALTER TABLE ONLY "public"."patient_personal"
    ADD CONSTRAINT "patient_personal_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."patient_risk"
    ADD CONSTRAINT "patient_risk_patient_id_key" UNIQUE ("patient_id");



ALTER TABLE ONLY "public"."patient_risk"
    ADD CONSTRAINT "patient_risk_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profession_type"
    ADD CONSTRAINT "profession_type_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."patient_general"
    ADD CONSTRAINT "ptients_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."referrals"
    ADD CONSTRAINT "referrals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."services"
    ADD CONSTRAINT "services_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sessions"
    ADD CONSTRAINT "sessions_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_mkb_10_code" ON "public"."mkb_10" USING "btree" ("code");



CREATE INDEX "idx_patient_medical_documents_document_type_id" ON "public"."patient_medical_documents" USING "btree" ("document_type_id");



CREATE INDEX "idx_patient_medical_documents_event_id" ON "public"."patient_medical_documents" USING "btree" ("event_id");



CREATE INDEX "idx_patient_medical_history_events_patient_id" ON "public"."patient_medical_history_events" USING "btree" ("patient_id");



CREATE INDEX "idx_pmdd_diagnosis_code" ON "public"."patient_medical_document_diagnoses" USING "btree" ("diagnosis_code");



CREATE INDEX "idx_pmdd_document_id" ON "public"."patient_medical_document_diagnoses" USING "btree" ("document_id");



CREATE INDEX "idx_pmhed_diagnosis_code" ON "public"."patient_medical_history_event_diagnoses" USING "btree" ("diagnosis_code");



CREATE INDEX "idx_pmhed_event_id" ON "public"."patient_medical_history_event_diagnoses" USING "btree" ("event_id");



CREATE OR REPLACE TRIGGER "handle_document_types_updated_at" BEFORE UPDATE ON "public"."document_types" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_insurance_plans_updated_at" BEFORE UPDATE ON "public"."insurance_plans" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_insurance_providers_updated_at" BEFORE UPDATE ON "public"."insurance_providers" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_patient_insurances_updated_at" BEFORE UPDATE ON "public"."patient_insurances" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_patient_medical_documents_updated_at" BEFORE UPDATE ON "public"."patient_medical_documents" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_patient_medical_history_event_updated_at" BEFORE UPDATE ON "public"."patient_medical_history_events" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "on_document_types_update" BEFORE UPDATE ON "public"."document_types" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "on_medical_document_types_update" BEFORE UPDATE ON "public"."medical_document_types" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "on_patient_general_update" BEFORE UPDATE ON "public"."patient_general" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "on_patient_id_documents_update" BEFORE UPDATE ON "public"."patient_id_documents" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "on_patient_notes_update" BEFORE UPDATE ON "public"."patient_notes" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "on_patient_personal_update" BEFORE UPDATE ON "public"."patient_personal" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "on_patient_risk_update" BEFORE UPDATE ON "public"."patient_risk" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



ALTER TABLE ONLY "public"."ambulances"
    ADD CONSTRAINT "ambulances_company_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."company_info"("id");



ALTER TABLE ONLY "public"."ambulances"
    ADD CONSTRAINT "ambulances_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."ambulances"
    ADD CONSTRAINT "ambulances_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."cities"
    ADD CONSTRAINT "cities_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id");



ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."company_info"
    ADD CONSTRAINT "company_info_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."company_info"
    ADD CONSTRAINT "company_info_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."document_types"
    ADD CONSTRAINT "document_type_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."document_types"
    ADD CONSTRAINT "document_type_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."employee_documents"
    ADD CONSTRAINT "employee_documents_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."employee_documents"
    ADD CONSTRAINT "employee_documents_document_type_fkey" FOREIGN KEY ("document_type") REFERENCES "public"."document_types"("id");



ALTER TABLE ONLY "public"."employee_documents"
    ADD CONSTRAINT "employee_documents_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."employee_type"
    ADD CONSTRAINT "employee_type_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."employee_type"
    ADD CONSTRAINT "employee_type_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."employees"
    ADD CONSTRAINT "employees_auth_id_fkey" FOREIGN KEY ("auth_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."employees"
    ADD CONSTRAINT "employees_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."employees"
    ADD CONSTRAINT "employees_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."employees"
    ADD CONSTRAINT "employees_vocation_fkey" FOREIGN KEY ("vocation") REFERENCES "public"."employee_type"("id");



ALTER TABLE ONLY "public"."exam_status"
    ADD CONSTRAINT "exam_status_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."exam_status"
    ADD CONSTRAINT "exam_status_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."exam_types"
    ADD CONSTRAINT "exam_types_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."exam_types"
    ADD CONSTRAINT "exam_types_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."exams"
    ADD CONSTRAINT "exams_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."exams"
    ADD CONSTRAINT "exams_employee_fkey" FOREIGN KEY ("employee") REFERENCES "public"."employees"("id");



ALTER TABLE ONLY "public"."exams"
    ADD CONSTRAINT "exams_exam_type_fkey" FOREIGN KEY ("exam_type") REFERENCES "public"."exam_types"("id");



ALTER TABLE ONLY "public"."exams"
    ADD CONSTRAINT "exams_info_fkey" FOREIGN KEY ("info") REFERENCES "public"."exam_status"("id");



ALTER TABLE ONLY "public"."exams"
    ADD CONSTRAINT "exams_patient_fkey" FOREIGN KEY ("patient") REFERENCES "public"."patient_general"("id");



ALTER TABLE ONLY "public"."exams"
    ADD CONSTRAINT "exams_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."insurance_plans"
    ADD CONSTRAINT "insurance_plans_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "public"."insurance_providers"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_emplyee_id_fkey" FOREIGN KEY ("emplyee_id") REFERENCES "public"."employees"("id");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patient_general"("id");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."join_ambulace_exam_type"
    ADD CONSTRAINT "join_ambulace_exam_type_abulance_id_fkey" FOREIGN KEY ("abulance_id") REFERENCES "public"."ambulances"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."join_ambulace_exam_type"
    ADD CONSTRAINT "join_ambulace_exam_type_exam_type_id_fkey" FOREIGN KEY ("exam_type_id") REFERENCES "public"."exam_types"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."join_ambulace_exam_type"
    ADD CONSTRAINT "juncion_ambulace_exam_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."join_employee_exam"
    ADD CONSTRAINT "junction_employee_exam_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."join_employee_exam"
    ADD CONSTRAINT "junction_employee_exam_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id");



ALTER TABLE ONLY "public"."join_employee_exam"
    ADD CONSTRAINT "junction_employee_exam_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "public"."exam_types"("id");



ALTER TABLE ONLY "public"."join_employee_exam"
    ADD CONSTRAINT "junction_employee_exam_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."join_patient_services"
    ADD CONSTRAINT "junction_patient_services_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id");



ALTER TABLE ONLY "public"."join_patient_services"
    ADD CONSTRAINT "junction_patient_services_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patient_general"("id");



ALTER TABLE ONLY "public"."join_patient_services"
    ADD CONSTRAINT "junction_patient_services_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id");



ALTER TABLE ONLY "public"."patient_medical_history_events"
    ADD CONSTRAINT "medical_history_events_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patient_general"("id");



ALTER TABLE ONLY "public"."patient_general"
    ADD CONSTRAINT "patient_general_citizenship_citizenship_country_id_fkey" FOREIGN KEY ("citizenship_country_id") REFERENCES "public"."countries"("id");



ALTER TABLE ONLY "public"."patient_general"
    ADD CONSTRAINT "patient_general_city_id_fkey" FOREIGN KEY ("residence_city_id") REFERENCES "public"."cities"("id");



ALTER TABLE ONLY "public"."patient_general"
    ADD CONSTRAINT "patient_general_country_id_fkey" FOREIGN KEY ("residence_country_id") REFERENCES "public"."countries"("id");



ALTER TABLE ONLY "public"."patient_general"
    ADD CONSTRAINT "patient_general_user_id_fkey" FOREIGN KEY ("patient_user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."patient_id_documents"
    ADD CONSTRAINT "patient_id_documents_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."patient_id_documents"
    ADD CONSTRAINT "patient_id_documents_document_type_fkey" FOREIGN KEY ("document_type") REFERENCES "public"."document_types"("id");



ALTER TABLE ONLY "public"."patient_id_documents"
    ADD CONSTRAINT "patient_id_documents_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patient_general"("id");



ALTER TABLE ONLY "public"."patient_id_documents"
    ADD CONSTRAINT "patient_id_documents_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."patient_insurances"
    ADD CONSTRAINT "patient_insurances_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."patient_insurances"
    ADD CONSTRAINT "patient_insurances_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patient_general"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."patient_insurances"
    ADD CONSTRAINT "patient_insurances_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."insurance_plans"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."patient_insurances"
    ADD CONSTRAINT "patient_insurances_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."patient_medical_document_diagnoses"
    ADD CONSTRAINT "patient_medical_document_diagnoses_diagnosis_code_fkey" FOREIGN KEY ("diagnosis_code") REFERENCES "public"."mkb_10"("code");



ALTER TABLE ONLY "public"."patient_medical_document_diagnoses"
    ADD CONSTRAINT "patient_medical_document_diagnoses_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."patient_medical_documents"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."patient_medical_documents"
    ADD CONSTRAINT "patient_medical_documents_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."patient_medical_documents"
    ADD CONSTRAINT "patient_medical_documents_document_type_id_fkey" FOREIGN KEY ("document_type_id") REFERENCES "public"."medical_document_types"("id");



ALTER TABLE ONLY "public"."patient_medical_documents"
    ADD CONSTRAINT "patient_medical_documents_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."patient_medical_history_events"("id");



ALTER TABLE ONLY "public"."patient_medical_documents"
    ADD CONSTRAINT "patient_medical_documents_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."patient_medical_history_event_diagnoses"
    ADD CONSTRAINT "patient_medical_history_event_diagnoses_diagnosis_code_fkey" FOREIGN KEY ("diagnosis_code") REFERENCES "public"."mkb_10"("code");



ALTER TABLE ONLY "public"."patient_medical_history_event_diagnoses"
    ADD CONSTRAINT "patient_medical_history_event_diagnoses_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."patient_medical_history_events"("id");



ALTER TABLE ONLY "public"."patient_medical_history_events"
    ADD CONSTRAINT "patient_medical_history_events_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."patient_medical_history_events"
    ADD CONSTRAINT "patient_medical_history_events_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."patient_notes"
    ADD CONSTRAINT "patient_notes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."patient_notes"
    ADD CONSTRAINT "patient_notes_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patient_general"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."patient_notes"
    ADD CONSTRAINT "patient_notes_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."patient_personal"
    ADD CONSTRAINT "patient_personal_birth_city_id_fkey" FOREIGN KEY ("birth_city_id") REFERENCES "public"."cities"("id");



ALTER TABLE ONLY "public"."patient_personal"
    ADD CONSTRAINT "patient_personal_birth_country_id_fkey" FOREIGN KEY ("birth_country_id") REFERENCES "public"."countries"("id");



ALTER TABLE ONLY "public"."patient_personal"
    ADD CONSTRAINT "patient_personal_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."patient_personal"
    ADD CONSTRAINT "patient_personal_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patient_general"("id");



ALTER TABLE ONLY "public"."patient_personal"
    ADD CONSTRAINT "patient_personal_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."patient_risk"
    ADD CONSTRAINT "patient_risk_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."patient_risk"
    ADD CONSTRAINT "patient_risk_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patient_general"("id");



ALTER TABLE ONLY "public"."patient_risk"
    ADD CONSTRAINT "patient_risk_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."profession_type"
    ADD CONSTRAINT "profession_type_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."profession_type"
    ADD CONSTRAINT "profession_type_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."patient_general"
    ADD CONSTRAINT "ptients_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."patient_general"
    ADD CONSTRAINT "ptients_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."referrals"
    ADD CONSTRAINT "referrals_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."referrals"
    ADD CONSTRAINT "referrals_employe_id_fkey" FOREIGN KEY ("employe_id") REFERENCES "public"."employees"("id");



ALTER TABLE ONLY "public"."referrals"
    ADD CONSTRAINT "referrals_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patient_general"("id");



ALTER TABLE ONLY "public"."referrals"
    ADD CONSTRAINT "referrals_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id");



ALTER TABLE ONLY "public"."referrals"
    ADD CONSTRAINT "referrals_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_exam_type_fkey" FOREIGN KEY ("exam_type") REFERENCES "public"."exam_types"("id");



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patient_general"("id");



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."services"
    ADD CONSTRAINT "services_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."services"
    ADD CONSTRAINT "services_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."sessions"
    ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



CREATE POLICY "Allow access to authenticated users" ON "public"."mkb_10" TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to manage document diagnoses" ON "public"."patient_medical_document_diagnoses" TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to manage documents" ON "public"."patient_medical_documents" TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to manage event diagnoses" ON "public"."patient_medical_history_event_diagnoses" TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to manage events" ON "public"."patient_medical_history_events" TO "authenticated" USING (true);



CREATE POLICY "Allow full access for service_role" ON "public"."mkb_10" TO "service_role" USING (true);



CREATE POLICY "Allow service_role to perform all actions" ON "public"."medical_document_types" TO "service_role" USING (true);



CREATE POLICY "Allow service_role to perform all actions" ON "public"."patient_medical_document_diagnoses" TO "service_role" USING (true);



CREATE POLICY "Allow service_role to perform all actions" ON "public"."patient_medical_documents" TO "service_role" USING (true);



CREATE POLICY "Allow service_role to perform all actions" ON "public"."patient_medical_history_events" TO "service_role" USING (true);



CREATE POLICY "CRUD for auth users" ON "public"."ambulances" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "CRUD for auth users" ON "public"."company_info" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "CRUD for authenticadted" ON "public"."medical_document_types" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "CRUD for authenticated" ON "public"."employee_type" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "CRUD for authenticated" ON "public"."employees" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "CRUD for authenticated" ON "public"."exams" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "CRUD for authenticated" ON "public"."patient_general" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "CRUD for users" ON "public"."document_types" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "CRUD for users" ON "public"."drug_register_me" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "CRUD for users" ON "public"."patient_id_documents" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "CRUD for users" ON "public"."patient_notes" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "CRUD for users" ON "public"."patient_personal" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "CRUD for users" ON "public"."patient_risk" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "CRUD for users." ON "public"."cities" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "CRUD for users." ON "public"."insurance_plans" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "CRUD for users." ON "public"."insurance_providers" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "CRUD for users." ON "public"."patient_insurances" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Select for authenticated" ON "public"."countries" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."ambulances" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."companies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."company_info" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."countries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."document_types" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."drug_register_me" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."drug_register_sr" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."employee_documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."employee_type" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."employees" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."exam_status" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."exams" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."insurance_plans" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."insurance_providers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."invoices" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."join_employee_exam" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."join_patient_services" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."medical_document_types" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mkb_10" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."patient_general" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."patient_id_documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."patient_insurances" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."patient_medical_document_diagnoses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."patient_medical_documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."patient_medical_history_event_diagnoses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."patient_medical_history_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."patient_notes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."patient_personal" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."patient_risk" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profession_type" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."referrals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."services" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sessions" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

















































































































































































GRANT ALL ON FUNCTION "public"."get_full_patient_data"("p_patient_id" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_full_patient_data"("p_patient_id" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_full_patient_data"("p_patient_id" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_full_system_data"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_full_system_data"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_full_system_data"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_patient_medical_history"("p_patient_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."get_patient_medical_history"("p_patient_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_patient_medical_history"("p_patient_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";


















GRANT ALL ON TABLE "public"."ambulances" TO "anon";
GRANT ALL ON TABLE "public"."ambulances" TO "authenticated";
GRANT ALL ON TABLE "public"."ambulances" TO "service_role";



GRANT ALL ON SEQUENCE "public"."ambulances_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."ambulances_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."ambulances_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."cities" TO "anon";
GRANT ALL ON TABLE "public"."cities" TO "authenticated";
GRANT ALL ON TABLE "public"."cities" TO "service_role";



GRANT ALL ON SEQUENCE "public"."cities_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."cities_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."cities_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."companies" TO "anon";
GRANT ALL ON TABLE "public"."companies" TO "authenticated";
GRANT ALL ON TABLE "public"."companies" TO "service_role";



GRANT ALL ON SEQUENCE "public"."companies_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."companies_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."companies_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."company_info" TO "anon";
GRANT ALL ON TABLE "public"."company_info" TO "authenticated";
GRANT ALL ON TABLE "public"."company_info" TO "service_role";



GRANT ALL ON SEQUENCE "public"."company_info_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."company_info_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."company_info_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."countries" TO "anon";
GRANT ALL ON TABLE "public"."countries" TO "authenticated";
GRANT ALL ON TABLE "public"."countries" TO "service_role";



GRANT ALL ON SEQUENCE "public"."countries_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."countries_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."countries_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."document_types" TO "anon";
GRANT ALL ON TABLE "public"."document_types" TO "authenticated";
GRANT ALL ON TABLE "public"."document_types" TO "service_role";



GRANT ALL ON SEQUENCE "public"."document_types_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."document_types_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."document_types_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."drug_register_me" TO "anon";
GRANT ALL ON TABLE "public"."drug_register_me" TO "authenticated";
GRANT ALL ON TABLE "public"."drug_register_me" TO "service_role";



GRANT ALL ON SEQUENCE "public"."drug_register_me_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."drug_register_me_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."drug_register_me_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."drug_register_sr" TO "anon";
GRANT ALL ON TABLE "public"."drug_register_sr" TO "authenticated";
GRANT ALL ON TABLE "public"."drug_register_sr" TO "service_role";



GRANT ALL ON SEQUENCE "public"."drug_register_sr_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."drug_register_sr_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."drug_register_sr_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."employee_documents" TO "anon";
GRANT ALL ON TABLE "public"."employee_documents" TO "authenticated";
GRANT ALL ON TABLE "public"."employee_documents" TO "service_role";



GRANT ALL ON SEQUENCE "public"."employee_documents_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."employee_documents_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."employee_documents_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."employee_type" TO "anon";
GRANT ALL ON TABLE "public"."employee_type" TO "authenticated";
GRANT ALL ON TABLE "public"."employee_type" TO "service_role";



GRANT ALL ON SEQUENCE "public"."employee_type_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."employee_type_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."employee_type_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."employees" TO "anon";
GRANT ALL ON TABLE "public"."employees" TO "authenticated";
GRANT ALL ON TABLE "public"."employees" TO "service_role";



GRANT ALL ON SEQUENCE "public"."employees_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."employees_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."employees_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."exam_status" TO "anon";
GRANT ALL ON TABLE "public"."exam_status" TO "authenticated";
GRANT ALL ON TABLE "public"."exam_status" TO "service_role";



GRANT ALL ON SEQUENCE "public"."exam_status_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."exam_status_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."exam_status_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."exam_types" TO "anon";
GRANT ALL ON TABLE "public"."exam_types" TO "authenticated";
GRANT ALL ON TABLE "public"."exam_types" TO "service_role";



GRANT ALL ON SEQUENCE "public"."exam_types_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."exam_types_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."exam_types_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."exams" TO "anon";
GRANT ALL ON TABLE "public"."exams" TO "authenticated";
GRANT ALL ON TABLE "public"."exams" TO "service_role";



GRANT ALL ON SEQUENCE "public"."exams_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."exams_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."exams_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."insurance_plans" TO "anon";
GRANT ALL ON TABLE "public"."insurance_plans" TO "authenticated";
GRANT ALL ON TABLE "public"."insurance_plans" TO "service_role";



GRANT ALL ON SEQUENCE "public"."insurance_plans_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."insurance_plans_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."insurance_plans_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."insurance_providers" TO "anon";
GRANT ALL ON TABLE "public"."insurance_providers" TO "authenticated";
GRANT ALL ON TABLE "public"."insurance_providers" TO "service_role";



GRANT ALL ON SEQUENCE "public"."insurance_providers_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."insurance_providers_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."insurance_providers_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."invoices" TO "anon";
GRANT ALL ON TABLE "public"."invoices" TO "authenticated";
GRANT ALL ON TABLE "public"."invoices" TO "service_role";



GRANT ALL ON SEQUENCE "public"."invoices_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."invoices_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."invoices_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."join_ambulace_exam_type" TO "anon";
GRANT ALL ON TABLE "public"."join_ambulace_exam_type" TO "authenticated";
GRANT ALL ON TABLE "public"."join_ambulace_exam_type" TO "service_role";



GRANT ALL ON SEQUENCE "public"."join_ambulace_exam_type_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."join_ambulace_exam_type_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."join_ambulace_exam_type_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."join_employee_exam" TO "anon";
GRANT ALL ON TABLE "public"."join_employee_exam" TO "authenticated";
GRANT ALL ON TABLE "public"."join_employee_exam" TO "service_role";



GRANT ALL ON SEQUENCE "public"."join_employee_exam_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."join_employee_exam_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."join_employee_exam_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."join_patient_services" TO "anon";
GRANT ALL ON TABLE "public"."join_patient_services" TO "authenticated";
GRANT ALL ON TABLE "public"."join_patient_services" TO "service_role";



GRANT ALL ON SEQUENCE "public"."join_patient_services_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."join_patient_services_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."join_patient_services_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."medical_document_types" TO "anon";
GRANT ALL ON TABLE "public"."medical_document_types" TO "authenticated";
GRANT ALL ON TABLE "public"."medical_document_types" TO "service_role";



GRANT ALL ON SEQUENCE "public"."medical_document_types_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."medical_document_types_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."medical_document_types_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."mkb_10" TO "anon";
GRANT ALL ON TABLE "public"."mkb_10" TO "authenticated";
GRANT ALL ON TABLE "public"."mkb_10" TO "service_role";



GRANT ALL ON SEQUENCE "public"."mkb_10_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."mkb_10_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."mkb_10_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."patient_general" TO "anon";
GRANT ALL ON TABLE "public"."patient_general" TO "authenticated";
GRANT ALL ON TABLE "public"."patient_general" TO "service_role";



GRANT ALL ON SEQUENCE "public"."patient_general_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."patient_general_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."patient_general_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."patient_id_documents" TO "anon";
GRANT ALL ON TABLE "public"."patient_id_documents" TO "authenticated";
GRANT ALL ON TABLE "public"."patient_id_documents" TO "service_role";



GRANT ALL ON SEQUENCE "public"."patient_id_documents_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."patient_id_documents_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."patient_id_documents_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."patient_insurances" TO "anon";
GRANT ALL ON TABLE "public"."patient_insurances" TO "authenticated";
GRANT ALL ON TABLE "public"."patient_insurances" TO "service_role";



GRANT ALL ON SEQUENCE "public"."patient_insurances_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."patient_insurances_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."patient_insurances_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."patient_medical_document_diagnoses" TO "anon";
GRANT ALL ON TABLE "public"."patient_medical_document_diagnoses" TO "authenticated";
GRANT ALL ON TABLE "public"."patient_medical_document_diagnoses" TO "service_role";



GRANT ALL ON TABLE "public"."patient_medical_documents" TO "anon";
GRANT ALL ON TABLE "public"."patient_medical_documents" TO "authenticated";
GRANT ALL ON TABLE "public"."patient_medical_documents" TO "service_role";



GRANT ALL ON SEQUENCE "public"."patient_medical_documents_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."patient_medical_documents_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."patient_medical_documents_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."patient_medical_history_event_diagnoses" TO "anon";
GRANT ALL ON TABLE "public"."patient_medical_history_event_diagnoses" TO "authenticated";
GRANT ALL ON TABLE "public"."patient_medical_history_event_diagnoses" TO "service_role";



GRANT ALL ON TABLE "public"."patient_medical_history_events" TO "anon";
GRANT ALL ON TABLE "public"."patient_medical_history_events" TO "authenticated";
GRANT ALL ON TABLE "public"."patient_medical_history_events" TO "service_role";



GRANT ALL ON SEQUENCE "public"."patient_medical_history_events_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."patient_medical_history_events_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."patient_medical_history_events_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."patient_notes" TO "anon";
GRANT ALL ON TABLE "public"."patient_notes" TO "authenticated";
GRANT ALL ON TABLE "public"."patient_notes" TO "service_role";



GRANT ALL ON SEQUENCE "public"."patient_notes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."patient_notes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."patient_notes_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."patient_personal" TO "anon";
GRANT ALL ON TABLE "public"."patient_personal" TO "authenticated";
GRANT ALL ON TABLE "public"."patient_personal" TO "service_role";



GRANT ALL ON SEQUENCE "public"."patient_personal_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."patient_personal_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."patient_personal_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."patient_risk" TO "anon";
GRANT ALL ON TABLE "public"."patient_risk" TO "authenticated";
GRANT ALL ON TABLE "public"."patient_risk" TO "service_role";



GRANT ALL ON SEQUENCE "public"."patient_risk_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."patient_risk_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."patient_risk_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."patient_risk_view" TO "anon";
GRANT ALL ON TABLE "public"."patient_risk_view" TO "authenticated";
GRANT ALL ON TABLE "public"."patient_risk_view" TO "service_role";



GRANT ALL ON TABLE "public"."profession_type" TO "anon";
GRANT ALL ON TABLE "public"."profession_type" TO "authenticated";
GRANT ALL ON TABLE "public"."profession_type" TO "service_role";



GRANT ALL ON SEQUENCE "public"."profession_type_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."profession_type_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."profession_type_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."referrals" TO "anon";
GRANT ALL ON TABLE "public"."referrals" TO "authenticated";
GRANT ALL ON TABLE "public"."referrals" TO "service_role";



GRANT ALL ON SEQUENCE "public"."referrals_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."referrals_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."referrals_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."reports" TO "anon";
GRANT ALL ON TABLE "public"."reports" TO "authenticated";
GRANT ALL ON TABLE "public"."reports" TO "service_role";



GRANT ALL ON SEQUENCE "public"."reports_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."reports_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."reports_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."services" TO "anon";
GRANT ALL ON TABLE "public"."services" TO "authenticated";
GRANT ALL ON TABLE "public"."services" TO "service_role";



GRANT ALL ON SEQUENCE "public"."services_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."services_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."services_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."sessions" TO "anon";
GRANT ALL ON TABLE "public"."sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."sessions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."sessions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."sessions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."sessions_id_seq" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";
































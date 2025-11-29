alter table "public"."patient_notes" drop constraint "patient_notes_patient_id_fkey";

alter table "public"."medical_document_types" add column "ai_source_locale" text;

alter table "public"."patient_medical_documents" add column "ai_translation_error" text;

alter table "public"."patient_medical_documents" add column "ai_translation_status" text not null default 'idle'::text;

alter table "public"."patient_notes" add column "ai_source_locale" text not null default '''en'''::text;

alter table "public"."patient_notes" add column "ai_translation_error" text;

alter table "public"."patient_notes" add column "ai_translation_status" text not null default '''idle'''::text;

alter table "public"."patient_notes" alter column "created_by" set not null;

alter table "public"."patient_notes" alter column "note" set not null;

alter table "public"."patient_notes" alter column "note" set data type jsonb using "note"::jsonb;

alter table "public"."patient_notes" alter column "patient_id" set not null;

alter table "public"."patient_medical_documents" add constraint "chk_patient_medical_documents_ai_translation_status" CHECK ((ai_translation_status = ANY (ARRAY['idle'::text, 'in_progress'::text, 'completed'::text, 'failed'::text]))) not valid;

alter table "public"."patient_medical_documents" validate constraint "chk_patient_medical_documents_ai_translation_status";

alter table "public"."patient_notes" add constraint "patient_notes_patient_id_fkey" FOREIGN KEY (patient_id) REFERENCES public.patient_general(id) not valid;

alter table "public"."patient_notes" validate constraint "patient_notes_patient_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_patient_medical_history(p_patient_id bigint)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
      pmhe.ai_translation_status,
      pmhe.ai_translation_error,
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
            pmd.ai_translation_status,
            pmd.ai_translation_error,
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
$function$
;


  create policy "DEV-ONLY: Allow all authenticated users full access to medical "
  on "storage"."objects"
  as permissive
  for all
  to public
using (((bucket_id = 'patient-medical-documents'::text) AND (auth.role() = 'authenticated'::text)))
with check (((bucket_id = 'patient-medical-documents'::text) AND (auth.role() = 'authenticated'::text)));




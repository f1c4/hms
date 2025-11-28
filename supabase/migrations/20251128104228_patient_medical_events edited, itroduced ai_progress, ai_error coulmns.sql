alter table "public"."patient_medical_history_events" add column "ai_translation_error" text;

alter table "public"."patient_medical_history_events" add column "ai_translation_status" text not null default 'idle'::text;

alter table "public"."patient_medical_history_events" add constraint "chk_ai_translation_status" CHECK ((ai_translation_status = ANY (ARRAY['idle'::text, 'in_progress'::text, 'completed'::text, 'failed'::text]))) not valid;

alter table "public"."patient_medical_history_events" validate constraint "chk_ai_translation_status";



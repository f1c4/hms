"use server";

import { createClient } from "@/utils/supabase/server";
import {
  PatientNotesFormSchema,
  PatientNotesFormType,
} from "../schemas/schemas";
import { getTargetLocales } from "@/i18n/locale-config";
import { PatientNotesClientModel } from "@/types/client-models";

// CREATE a new patient note
export async function createPatientNote(
  noteData: PatientNotesFormType,
  patientId: number,
  locale: string,
): Promise<PatientNotesClientModel> {
  const client = await createClient();
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError || !userData.user) throw new Error("User not authenticated");

  const schema = PatientNotesFormSchema(() => "");
  const validated = schema.safeParse(noteData);
  if (!validated.success) throw new Error("Invalid note data provided");

  const noteText = validated.data.note?.trim() ?? "";
  const hasTranslatableContent = noteText.length > 0;

  const { data, error } = await client
    .from("patient_notes")
    .insert({
      patient_id: patientId,
      created_by: userData.user.id,
      note: noteText ? { [locale]: noteText } : {}, // jsonb
      ai_source_locale: locale,
      ai_translation_status: hasTranslatableContent ? "in_progress" : "idle",
      ai_translation_error: null,
    })
    .select()
    .single();

  if (error || !data) {
    console.error("Create Note Error:", error?.message);
    throw new Error("Failed to create patient note.");
  }

  if (hasTranslatableContent) {
    client.functions
      .invoke("translate_medical", {
        body: {
          tableName: "patient_notes",
          recordId: data.id,
          fields: ["note"],
          sourceLocale: locale,
          targetLocales: getTargetLocales(locale),
        },
      })
      .catch((err) => {
        console.error(
          "Failed to invoke translate_medical on note create:",
          err,
        );
      });
  }

  const clientData: PatientNotesClientModel = {
    ...data,
    created_at: new Date(data.created_at),
    updated_at: data.updated_at ? new Date(data.updated_at) : null,
    note: (data.note as Record<string, string>) || {},
  };

  return clientData;
}

// UPDATE an existing patient note
export async function updatePatientNote(
  noteData: PatientNotesFormType,
  noteId: number,
  locale: string,
): Promise<PatientNotesClientModel> {
  const client = await createClient();
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError || !userData.user) throw new Error("User not authenticated");

  const schema = PatientNotesFormSchema(() => "");
  const validated = schema.safeParse(noteData);
  if (!validated.success) throw new Error("Invalid note data provided");

  const newText = validated.data.note?.trim() ?? "";

  // Load existing note to get ai_source_locale and current json
  const { data: existing, error: fetchError } = await client
    .from("patient_notes")
    .select("note, ai_source_locale, ai_translation_status, version")
    .eq("id", noteId)
    .single();

  if (fetchError || !existing) {
    console.error("Fetch Note Error:", fetchError?.message);
    throw new Error("Patient note not found.");
  }

  const sourceLocale: string = existing.ai_source_locale || locale;
  const isEditingSource = locale === sourceLocale;

  const existingJson =
    (existing.note as Record<string, string> | null | undefined) ?? {};
  const prevSourceText = existingJson[sourceLocale] ?? "";

  const sourceChanged = isEditingSource && prevSourceText !== newText;
  const hasTranslatableContent = newText.length > 0;

  // Prepare merged JSON; if not editing source, keep existing untouched
  const mergedNote: Record<string, string> = isEditingSource
    ? {
      ...existingJson,
      ...(hasTranslatableContent ? { [sourceLocale]: newText } : {}),
    }
    : existingJson;

  const updatePayload: Record<string, unknown> = {
    note: mergedNote,
    updated_by: userData.user.id,
    version: (existing.version ?? 1) + 1,
  };

  if (sourceChanged && hasTranslatableContent) {
    updatePayload.ai_translation_status = "in_progress";
    updatePayload.ai_translation_error = null;
  }

  const { data: updated, error } = await client
    .from("patient_notes")
    .update(updatePayload)
    .eq("id", noteId)
    .select()
    .single();

  if (error || !updated) {
    console.error("Update Note Error:", error?.message);
    throw new Error("Failed to update patient note.");
  }

  if (sourceChanged && hasTranslatableContent) {
    client.functions
      .invoke("translate_medical", {
        body: {
          tableName: "patient_notes",
          recordId: noteId,
          fields: ["note"],
          sourceLocale: sourceLocale,
          targetLocales: getTargetLocales(sourceLocale),
        },
      })
      .catch((err) => {
        console.error(
          "Failed to invoke translate_medical on note update:",
          err,
        );
      });
  }

  const clientData: PatientNotesClientModel = {
    ...updated,
    created_at: new Date(updated.created_at),
    updated_at: updated.updated_at ? new Date(updated.updated_at) : null,
    note: (updated.note as Record<string, string>) || {},
  };

  return clientData;
}

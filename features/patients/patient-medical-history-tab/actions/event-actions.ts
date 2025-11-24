"use server";

import { MedicalHistoryEventClientModel } from "@/types/client-models";
import { createClient } from "@/utils/supabase/server";
import { unstable_noStore as noStore } from "next/cache";
import {
  CreateMedicalHistoryEventInput,
  CreateMedicalHistoryEventSchema,
  UpdateMedicalHistoryEventInput,
  UpdateMedicalHistoryEventSchema,
} from "../schemas/event-server-schemas";
import { MedicalHistoryEventModel } from "@/types/data-models";
import { getTargetLocales } from "@/i18n/locale-config";

/**
 * Fetches the complete medical history for a single patient.
 * This includes all events, documents, and associated diagnoses.
 * @param patientId The ID of the patient to fetch.
 * @returns An array of MedicalHistoryEventModel objects or null on error.
 */
export async function getPatientMedicalHistory(
  patientId: number,
): Promise<MedicalHistoryEventModel[] | null> {
  noStore();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase.rpc("get_patient_medical_history", {
    p_patient_id: patientId,
  });

  if (error) {
    console.error("Error fetching patient medical history:", error);
    return null;
  }

  return data;
}

/**
 * Creates a new medical history event for a patient and triggers background translation.
 * @param input The data for the new event, conforming to CreateMedicalHistoryEventInput.
 * @returns The newly created and client-ready MedicalHistoryEventClientModel on success.
 */
export async function createMedicalHistoryEvent(
  input: CreateMedicalHistoryEventInput,
): Promise<MedicalHistoryEventClientModel> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const validationResult = CreateMedicalHistoryEventSchema.safeParse(input);
  if (!validationResult.success) {
    console.error("Zod validation error:", validationResult.error.flatten());
    throw new Error("Invalid server action input");
  }

  const { patientId, title, event_date, notes, diagnoses, ai_source_locale } =
    validationResult.data;

  // 1. Insert the new event record
  const { data: insertedEvent, error: eventError } = await supabase
    .from("patient_medical_history_events")
    .insert({
      patient_id: patientId,
      event_date: event_date.toISOString(),
      title: { [ai_source_locale]: title },
      notes: notes ? { [ai_source_locale]: notes } : null,
      created_by: user.id,
      ai_source_locale: ai_source_locale,
    })
    .select("id")
    .single();

  if (eventError) {
    console.error("Database Error creating medical history event:", eventError);
    throw new Error("Failed to create medical history event on the server.");
  }

  const newEventId = insertedEvent.id;

  // 2. Link diagnoses if they exist
  if (diagnoses && diagnoses.length > 0) {
    const diagnosesToLink = diagnoses.map((code) => ({
      event_id: newEventId,
      diagnosis_code: code,
    }));
    const { error: diagnosesError } = await supabase
      .from("patient_medical_history_event_diagnoses")
      .insert(diagnosesToLink);

    if (diagnosesError) {
      console.error("Error linking diagnoses to event:", diagnosesError);
      throw new Error("Failed to link diagnoses to the new event.");
    }
  }

  // 3. Trigger background translation (fire-and-forget)
  const translatableFields = ["title"];
  if (notes) {
    translatableFields.push("notes");
  }

  supabase.functions
    .invoke("translate", {
      body: {
        tableName: "patient_medical_history_events",
        recordId: newEventId,
        fields: translatableFields,
        sourceLocale: ai_source_locale,
        targetLocales: getTargetLocales(ai_source_locale),
      },
    })
    .catch((error) => {
      console.error(
        "Failed to invoke translate Edge Function on event create:",
        error,
      );
    });

  // 4. Fetch the complete new event data to return to the client.
  const { data: newEvent, error: fetchError } = await supabase
    .from("patient_medical_history_events")
    .select(
      `*, diagnoses:patient_medical_history_event_diagnoses(diagnosis_code, mkb_10(diagnosis_translations)), documents:patient_medical_documents(*, document_type:medical_document_types(name_translations), diagnoses:patient_medical_document_diagnoses(diagnosis_code, mkb_10(diagnosis_translations)))`,
    )
    .eq("id", newEventId)
    .single();

  if (fetchError) {
    console.error("Error fetching new event data:", fetchError);
    throw new Error("Failed to retrieve the new event after creation.");
  }

  // 5. Transform the data for the client
  return {
    ...newEvent,
    title: newEvent.title as Record<string, string>,
    notes: newEvent.notes as Record<string, string> | null,
    event_date: new Date(newEvent.event_date),
    diagnoses: newEvent.diagnoses.map((d) => ({
      diagnosis_code: d.diagnosis_code,
      diagnosis_translations: d.mkb_10.diagnosis_translations as
        | Record<string, string>
        | null,
    })),
    documents: newEvent.documents.map((doc) => ({
      ...doc,
      document_date: new Date(doc.document_date),
      notes: doc.notes as Record<string, string> | null,
      document_type_translations: doc.document_type.name_translations as
        | Record<string, string>
        | null,
      diagnoses: doc.diagnoses.map((d) => ({
        diagnosis_code: d.diagnosis_code,
        diagnosis_translations: d.mkb_10.diagnosis_translations as
          | Record<string, string>
          | null,
      })),
    })),
  };
}

/**
 * Updates an existing medical history event for a patient.
 * @param input The data for the event update, conforming to UpdateMedicalHistoryEventInput.
 * @returns The updated and client-ready MedicalHistoryEventClientModel on success.
 */
export async function updateMedicalHistoryEvent(
  input: UpdateMedicalHistoryEventInput,
): Promise<MedicalHistoryEventClientModel> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const validationResult = UpdateMedicalHistoryEventSchema.safeParse(input);
  if (!validationResult.success) {
    console.error("Zod validation error:", validationResult.error.flatten());
    throw new Error("Invalid server action input");
  }

  const { id, version, title, event_date, notes, diagnoses, ai_source_locale } =
    validationResult.data;

  // 1. Atomically update the event and increment the version.
  const { data: updatedEventData, error: updateError } = await supabase
    .from("patient_medical_history_events")
    .update({
      event_date: event_date.toISOString(),
      title: { [ai_source_locale]: title },
      notes: notes ? { [ai_source_locale]: notes } : null,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
      version: version + 1,
      ai_source_locale: ai_source_locale,
    })
    .match({ id: id, version: version }) // Optimistic locking check
    .select("id")
    .single();

  if (updateError || !updatedEventData) {
    console.error("DB Error or version mismatch on event update:", updateError);
    throw new Error(
      "Conflict: The event has been updated by someone else. Please refresh and try again.",
    );
  }

  // 2. Synchronize the diagnoses
  await supabase.from("patient_medical_history_event_diagnoses").delete().eq(
    "event_id",
    id,
  );

  if (diagnoses && diagnoses.length > 0) {
    const diagnosesToLink = diagnoses.map((code) => ({
      event_id: id,
      diagnosis_code: code,
    }));
    await supabase.from("patient_medical_history_event_diagnoses").insert(
      diagnosesToLink,
    );
  }

  // 3. Trigger background translation (fire-and-forget)
  const translatableFields = ["title"];
  if (notes) {
    translatableFields.push("notes");
  }

  supabase.functions
    .invoke("translate", {
      body: {
        tableName: "patient_medical_history_events",
        recordId: id,
        fields: translatableFields,
        sourceLocale: ai_source_locale,
        targetLocales: getTargetLocales(ai_source_locale),
      },
    })
    .catch((error) => {
      console.error(
        "Failed to invoke translate Edge Function on event update:",
        error,
      );
    });

  // 4. Fetch the complete updated event data to return to the client
  const { data: updatedEvent, error: fetchError } = await supabase
    .from("patient_medical_history_events")
    .select(
      `*, diagnoses:patient_medical_history_event_diagnoses(diagnosis_code, mkb_10(diagnosis_translations)), documents:patient_medical_documents(*, document_type:medical_document_types(name_translations), diagnoses:patient_medical_document_diagnoses(diagnosis_code, mkb_10(diagnosis_translations)))`,
    )
    .eq("id", id)
    .single();

  if (fetchError) {
    console.error("Error fetching updated event data:", fetchError);
    throw new Error("Failed to retrieve the updated event after saving.");
  }

  // 5. Transform the data for the client
  return {
    ...updatedEvent,
    title: updatedEvent.title as Record<string, string>,
    notes: updatedEvent.notes as Record<string, string> | null,
    event_date: new Date(updatedEvent.event_date),
    diagnoses: updatedEvent.diagnoses.map((d) => ({
      diagnosis_code: d.diagnosis_code,
      diagnosis_translations: d.mkb_10.diagnosis_translations as
        | Record<string, string>
        | null,
    })),
    documents: updatedEvent.documents.map((doc) => ({
      ...doc,
      document_date: new Date(doc.document_date),
      notes: doc.notes as Record<string, string> | null,
      document_type_translations: doc.document_type.name_translations as
        | Record<string, string>
        | null,
      diagnoses: doc.diagnoses.map((d) => ({
        diagnosis_code: d.diagnosis_code,
        diagnosis_translations: d.mkb_10.diagnosis_translations as
          | Record<string, string>
          | null,
      })),
    })),
  };
}

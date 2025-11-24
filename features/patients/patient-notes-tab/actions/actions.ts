"use server";

import { createClient } from "@/utils/supabase/server";
import {
  PatientNotesFormSchema,
  PatientNotesFormType,
} from "../schemas/schemas";
import { PatientNotesTypeDb } from "../types";

// CREATE a new patient note
export async function createPatientNote(
  noteData: PatientNotesFormType,
  patientId: number,
): Promise<PatientNotesTypeDb["Row"]> {
  const client = await createClient();
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError || !userData.user) throw new Error("User not authenticated");

  const schema = PatientNotesFormSchema(() => "");
  const validatedData = schema.safeParse(noteData);
  if (!validatedData.success) throw new Error("Invalid note data provided");

  const { data, error } = await client
    .from("patient_notes")
    .insert({
      patient_id: patientId,
      note: validatedData.data.note,
      created_by: userData.user.id,
      updated_by: userData.user.id,
    })
    .select()
    .single();

  if (error) {
    console.error("Create Note Error:", error.message);
    throw new Error("Failed to create patient note.");
  }

  return data;
}

// UPDATE an existing patient note
export async function updatePatientNote(
  noteData: PatientNotesFormType,
  noteId: number,
): Promise<PatientNotesTypeDb["Row"]> {
  const client = await createClient();
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError || !userData.user) throw new Error("User not authenticated");

  const schema = PatientNotesFormSchema(() => "");
  const validatedData = schema.safeParse(noteData);
  if (!validatedData.success) throw new Error("Invalid note data provided");

  const { data, error } = await client
    .from("patient_notes")
    .update({
      note: validatedData.data.note,
      updated_by: userData.user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", noteId)
    .select()
    .single();

  if (error) {
    console.error("Update Note Error:", error.message);
    throw new Error("Failed to update patient note.");
  }

  return data;
}

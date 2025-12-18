"use server";

import { createClient } from "@/utils/supabase/server";
import {
  PatientPersonalFormSchema,
  PatientPersonalFormType,
} from "../schemas/schemas";
import { revalidatePath } from "next/cache";
import { camelToSnakeObj } from "@/utils/utils";
import { Database } from "@/types/database-custom";
import { PatientPersonalModel } from "@/types/data-models";

type PatientPersonalTable = Database["public"]["Tables"]["patient_personal"];
type PatientPersonalUpdate = PatientPersonalTable["Update"];
type PatientPersonalInsert = PatientPersonalTable["Insert"];

// Updated select to include profession
const selectWithDetails = `
  *,
  birthCity:cities!birth_city_id (id, name, postal_code),
  birth_country_iso2:countries!birth_country_id (iso2),
  profession:professions!profession_id (id, name_translations)
`;

// Helper to transform raw DB result to PatientPersonalModel
function transformToModel(rawData: {
  birth_country_iso2: { iso2: string } | null;
  birthCity: { id: number; name: unknown; postal_code: string } | null;
  profession: { id: number; name_translations: unknown } | null;
  [key: string]: unknown;
}): PatientPersonalModel {
  const { birth_country_iso2, birthCity, profession, ...restOfPatientData } =
    rawData;

  return {
    ...restOfPatientData,
    birthCountryIso2: birth_country_iso2?.iso2 || null,
    birthCity: birthCity
      ? {
        id: birthCity.id,
        name: birthCity.name as Record<string, string> || null,
        postal_code: birthCity.postal_code,
      }
      : null,
    profession: profession
      ? {
        id: profession.id,
        name_translations:
          profession.name_translations as Record<string, string> || null,
      }
      : null,
  } as PatientPersonalModel;
}

// CREATE PATIENT PERSONAL INFO
export async function createPatientPersonal(
  patientData: PatientPersonalFormType,
  patientId: number,
): Promise<PatientPersonalModel> {
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const validatedData = PatientPersonalFormSchema(() => "").safeParse(
    patientData,
  );
  if (!validatedData.success) throw new Error("Invalid patient data provided");

  const snakeCaseData = camelToSnakeObj(validatedData.data);

  const dataToInsert: PatientPersonalInsert = {
    ...snakeCaseData,
    patient_id: patientId,
    created_by: user.id,
  };

  const { data: insertedPatient, error } = await client
    .from("patient_personal")
    .insert(dataToInsert)
    .select(selectWithDetails)
    .single();

  if (error) {
    console.error("Create Error:", error.message);
    throw new Error("Failed to create new patient.");
  }

  revalidatePath(`/dashboard/patients/${insertedPatient.id}`);
  return transformToModel(insertedPatient);
}

// UPDATE PATIENT PERSONAL INFO
export async function updatePatientPersonal(
  patientData: PatientPersonalFormType,
  patientId: number,
  currentVersion: number,
): Promise<PatientPersonalModel> {
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const validatedData = PatientPersonalFormSchema(() => "").safeParse(
    patientData,
  );
  if (!validatedData.success) throw new Error("Invalid patient data provided");

  const snakeCaseData = camelToSnakeObj(validatedData.data);

  const dataToUpdate: PatientPersonalUpdate = {
    ...snakeCaseData,
    updated_by: user.id,
    version: currentVersion + 1,
  };

  const { data: updatedPatient, error, count } = await client
    .from("patient_personal")
    .update(dataToUpdate)
    .eq("patient_id", patientId)
    .eq("version", currentVersion)
    .select(selectWithDetails)
    .single();

  if (count === 0 && !error) {
    throw new Error(
      "Save failed. The data was modified by another user. Please refresh.",
    );
  }

  if (error) {
    console.error("Update Error:", error.message);
    throw new Error("Failed to update patient information.");
  }

  revalidatePath(`/dashboard/patients/${patientId}`);
  return transformToModel(updatedPatient);
}

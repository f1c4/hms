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

function replaceEmptyStringsWithNull<
  T extends PatientPersonalInsert | PatientPersonalUpdate,
>(obj: T): T {
  const result = { ...obj } as T;
  (Object.keys(result) as Array<keyof T>).forEach((key) => {
    if (result[key] === "") {
      (result[key] as unknown) = null;
    }
  });
  return result;
}

const selectWithDetails = `
  *,
  birthCity:cities!birth_city_id (id, name, postal_code),
  birth_country_iso2:countries!birth_country_id (iso2)
`;

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

  const cleanedData = replaceEmptyStringsWithNull(validatedData.data);
  const snakeCaseData = camelToSnakeObj(cleanedData);

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

  // Post-processing step to flatten the iso2 object
  const { birth_country_iso2, ...restOfPatientData } = insertedPatient;
  const result = {
    ...restOfPatientData,
    birthCountryIso2: birth_country_iso2?.iso2 || null,
  };

  revalidatePath(`/dashboard/patients/${insertedPatient.id}`);
  return result;
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

  const cleanedData = replaceEmptyStringsWithNull(validatedData.data);
  const snakeCaseData = camelToSnakeObj(cleanedData);

  const dataToUpdate = {
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

  // Post-processing step to flatten the iso2 object
  const { birth_country_iso2, ...restOfPatientData } = updatedPatient;
  const result = {
    ...restOfPatientData,
    birthCountryIso2: birth_country_iso2?.iso2 || null,
  };

  revalidatePath(`/dashboard/patients/${patientId}`);
  return result;
}

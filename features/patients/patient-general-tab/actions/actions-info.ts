"use server";

import {
  PatientGeneralFormOutput,
  PatientGeneralFormSchema,
} from "../schemas/info-form-schema";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { camelToSnakeObj } from "@/utils/utils";
import { Database } from "@/types/database-custom";
import { PatientGeneralClientModel } from "@/types/client-models";

type PatientGeneralTable = Database["public"]["Tables"]["patient_general"];
type PatientGeneralInsert = PatientGeneralTable["Insert"];
type PatientGeneralUpdate = PatientGeneralTable["Update"];

function replaceEmptyStringsWithNull<
  T extends PatientGeneralInsert | PatientGeneralUpdate,
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
  residenceCity:cities!residence_city_id (id, name, postal_code),
  residenceCountryIso2:countries!residence_country_id (iso2),
  citizenshipCountryIso2:countries!citizenship_country_id (iso2)
`;

// CREATE PATIENT GENERAL INFO
export async function createPatientGeneral(
  patientData: PatientGeneralFormOutput,
): Promise<PatientGeneralClientModel> {
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const validatedData = PatientGeneralFormSchema(() => "").safeParse(
    patientData,
  );
  if (!validatedData.success) throw new Error("Invalid patient data provided");

  const cleanedData = replaceEmptyStringsWithNull(validatedData.data);
  const snakeCaseData = camelToSnakeObj(cleanedData);

  const dataToInsert: PatientGeneralInsert = {
    ...snakeCaseData,
    first_name: cleanedData.firstName,
    last_name: cleanedData.lastName,
    date_of_birth: cleanedData.dateOfBirth?.toISOString() ?? "",
    created_by: user.id,
  };

  const { data: insertedPatient, error } = await client
    .from("patient_general")
    .insert(dataToInsert)
    .select(selectWithDetails)
    .single();

  if (error) {
    console.error("Create Error:", error.message);
    throw new Error("Failed to create new patient.");
  }

  // Type-safe post-processing to flatten the country object
  const {
    residenceCountryIso2,
    citizenshipCountryIso2,
    residenceCity,
    ...restOfData
  } = insertedPatient;
  const result: PatientGeneralClientModel = {
    ...restOfData,
    residenceCountryIso2: residenceCountryIso2?.iso2 || null,
    citizenshipCountryIso2: citizenshipCountryIso2?.iso2 || null,
    date_of_birth: insertedPatient.date_of_birth
      ? new Date(insertedPatient.date_of_birth)
      : null,
    residenceCity: {
      ...residenceCity,
      name: residenceCity?.name as Record<string, string> || null,
      id: residenceCity?.id || 0,
      postal_code: residenceCity?.postal_code || "",
    },
  };

  revalidatePath("/dashboard/patients");
  revalidatePath(`/dashboard/patients/${insertedPatient.id}`);

  return result;
}

// UPDATE PATIENT GENERAL INFO
export async function updatePatientGeneral(
  patientData: PatientGeneralFormOutput,
  patientId: number,
  currentVersion: number,
): Promise<PatientGeneralClientModel> {
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const validatedData = PatientGeneralFormSchema(() => "").safeParse(
    patientData,
  );
  if (!validatedData.success) throw new Error("Invalid patient data provided");

  const cleanedData = replaceEmptyStringsWithNull(validatedData.data);
  const snakeCaseData = camelToSnakeObj(cleanedData);

  const dataToUpdate = {
    ...snakeCaseData,
    date_of_birth: cleanedData.dateOfBirth?.toISOString() ?? "",
    updated_by: user.id,
    version: currentVersion + 1,
  };

  const { data: updatedPatient, error, count } = await client
    .from("patient_general")
    .update(dataToUpdate)
    .eq("id", patientId)
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

  // Type-safe post-processing to flatten the country object
  const {
    residenceCountryIso2,
    citizenshipCountryIso2,
    residenceCity,
    ...restOfData
  } = updatedPatient;
  const result: PatientGeneralClientModel = {
    ...restOfData,
    residenceCountryIso2: residenceCountryIso2?.iso2 || null,
    citizenshipCountryIso2: citizenshipCountryIso2?.iso2 || null,
    date_of_birth: updatedPatient.date_of_birth
      ? new Date(updatedPatient.date_of_birth)
      : null,
    residenceCity: {
      ...residenceCity,
      name: residenceCity?.name as Record<string, string> || null,
      id: residenceCity?.id || 0,
      postal_code: residenceCity?.postal_code || "",
    },
  };

  revalidatePath("/dashboard/patients");
  revalidatePath(`/dashboard/patients/${patientId}`);
  return result;
}

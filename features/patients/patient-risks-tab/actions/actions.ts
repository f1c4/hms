"use server";

import { createClient } from "@/utils/supabase/server";
import {
  PatientRiskFormOutput,
  PatientRiskFormSchema,
} from "../schemas/schemas";
import { Database } from "@/types/database-custom";
import { PatientRisksModel } from "@/types/data-models";
import { revalidatePath } from "next/cache";
import { camelToSnakeObj } from "@/utils/utils";

type PatientRiskInsert = Database["public"]["Tables"]["patient_risk"]["Insert"];
type PatientRisksUpdate =
  Database["public"]["Tables"]["patient_risk"]["Update"];

function replaceEmptyStringsWithNull<
  T extends PatientRiskInsert | PatientRisksUpdate,
>(obj: T): T {
  const result = { ...obj } as T;
  (Object.keys(result) as Array<keyof T>).forEach((key) => {
    if (result[key] === "") {
      (result[key] as unknown) = null;
    }
  });
  return result;
}

/// CREATE PATIENT RISK INFO
export async function createPatientRisk(
  riskData: PatientRiskFormOutput,
  patientId: number,
): Promise<PatientRisksModel> {
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const validatedData = PatientRiskFormSchema(() => "").safeParse(riskData);
  if (!validatedData.success) {
    throw new Error("Invalid patient data provided");
  }

  const cleanedData = replaceEmptyStringsWithNull(validatedData.data);
  const snakeCaseData = camelToSnakeObj(cleanedData);

  const dataToInsert: PatientRiskInsert = {
    ...snakeCaseData,
    patient_id: patientId,
    created_by: user.id,
  };

  const { error: insertError } = await client
    .from("patient_risk")
    .insert(dataToInsert)
    .single();

  if (insertError) {
    console.error("Create Error:", insertError.message);
    throw new Error("Failed to create patient risk information.");
  }

  // After successful insert, fetch the data from the view to get calculated fields
  const { data: newViewData, error: viewError } = await client
    .from("patient_risk_view")
    .select("*")
    .eq("patient_id", patientId)
    .single();

  if (viewError || !newViewData) {
    console.error("View Fetch Error:", viewError?.message);
    throw new Error("Failed to fetch updated patient data after creation.");
  }

  revalidatePath(`/dashboard/patients/${patientId}`);
  return newViewData;
}

// UPDATE PATIENT RISK INFO
export async function updatePatientRisk(
  riskData: PatientRiskFormOutput,
  patientId: number,
  currentVersion: number,
): Promise<PatientRisksModel> {
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const validatedData = PatientRiskFormSchema(() => "").safeParse(riskData);
  if (!validatedData.success) {
    throw new Error("Invalid patient data provided");
  }

  const cleanedData = replaceEmptyStringsWithNull(validatedData.data);
  const snakeCaseData = camelToSnakeObj(cleanedData);

  const dataToUpdate = {
    ...snakeCaseData,
    updated_by: user.id,
    version: currentVersion + 1,
  };

  const { error, count } = await client
    .from("patient_risk")
    .update(dataToUpdate)
    .eq("patient_id", patientId)
    .eq("version", currentVersion);

  if (count === 0 && !error) {
    throw new Error(
      "Save failed. The data was modified by another user. Please refresh.",
    );
  }
  if (error) {
    console.error("Update Error:", error.message);
    throw new Error("Failed to update patient risk information.");
  }

  // After successful update, fetch the data from the view
  const { data: updatedViewData, error: viewError } = await client
    .from("patient_risk_view")
    .select("*")
    .eq("patient_id", patientId)
    .single();

  if (viewError || !updatedViewData) {
    console.error("View Fetch Error:", viewError?.message);
    throw new Error("Failed to fetch updated patient data after update.");
  }

  revalidatePath(`/dashboard/patients/${patientId}`);
  return updatedViewData;
}

"use server";

import { FullPatientDataModel } from "@/types/data-models";
import { createClient } from "@/utils/supabase/server";

//GET FULL PATIENT DATA
export async function getPatientData(
  patientId: number,
): Promise<FullPatientDataModel> {
  const client = await createClient();

  const { data, error } = await client.rpc("get_full_patient_data", {
    p_patient_id: patientId,
  });

  if (error) {
    console.error("RPC Error fetching patient data:", error);
    throw new Error(error.message);
  }

  return data;
}

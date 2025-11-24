"use server";

import { createClient } from "@/utils/supabase/server";
import { unstable_noStore as noStore } from "next/cache";
import { z } from "zod";

import {
  CreateInsuranceInput,
  CreateInsuranceSchema,
  UpdateInsuranceInput,
  UpdateInsuranceSchema,
} from "../schemas/insurance-doc-schema";
import { PatientInsuranceModel } from "@/types/data-models";
import { Database } from "@/types/database-custom";

// --- Type Definitions ---

type ProviderForSelect = {
  id: number;
  name_translations: Record<string, string> | null;
};

type PlanForSelect = {
  id: number;
  name_translations: Record<string, string> | null;
};

type ZodTreeError = {
  errors: string[];
  properties?: {
    [key: string]: ZodTreeError;
  };
};

export type ActionError = {
  type: "validation" | "conflict" | "notFound";
  messageKey: string;
  details?: ZodTreeError;
};

type PatientInsurancesTable =
  Database["public"]["Tables"]["patient_insurances"];
type PatientInsuranceInsert = PatientInsurancesTable["Insert"];
type PatientInsuranceUpdate = PatientInsurancesTable["Update"];

const BUCKET_NAME = "patient-insurances";

const selectWithDetails = `
  *,
  plan:insurance_plans (
    *,
    provider:insurance_providers (
      *
    )
  )
`;

// --- File & Utility Actions ---

/**
 * Creates a signed URL to securely view/download an insurance file.
 */
export async function getInsuranceSignedViewUrl(filePath: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(filePath, 60); // URL is valid for 60 seconds

  if (error) {
    console.error("Get Signed View URL Error:", error);
    throw new Error("Could not create a secure view link.");
  }
  return data;
}

/**
 * Generates a unique, permanent path for an insurance file in Supabase storage.
 */
export async function getInsuranceUploadPath(
  patientId: number,
  fileName: string,
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required.");

  const path = `${BUCKET_NAME}/${patientId}/${crypto.randomUUID()}-${fileName}`;
  return { path };
}

/**
 * Fetches all insurance providers for dropdowns.
 */
export async function getInsuranceProviders() {
  noStore();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("insurance_providers")
    .select("id, name_translations");

  if (error) {
    console.error("Error fetching insurance providers:", error);
    throw new Error("Could not fetch insurance providers.");
  }
  return (data as ProviderForSelect[]) ?? [];
}

/**
 * Fetches all plans for a given provider for dropdowns.
 * @param providerId The ID of the insurance provider.
 */
export async function getInsurancePlans(providerId: number) {
  noStore();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("insurance_plans")
    .select("id, name_translations")
    .eq("provider_id", providerId);

  if (error) {
    console.error("Error fetching insurance plans:", error);
    throw new Error("Could not fetch insurance plans.");
  }
  return (data as PlanForSelect[]) ?? [];
}

// --- CRUD Actions ---

/**
 * Creates a new patient insurance record.
 */
export async function createPatientInsurance(
  input: CreateInsuranceInput,
): Promise<{ data?: PatientInsuranceModel; error?: ActionError }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required.");

  const validation = CreateInsuranceSchema.safeParse(input);
  if (!validation.success) {
    return {
      error: {
        type: "validation",
        messageKey: "Errors.validationError",
        details: z.treeifyError(validation.error),
      },
    };
  }

  const dataToInsert: PatientInsuranceInsert = {
    ...validation.data,
    effective_date: validation.data.effective_date.toISOString(),
    expiry_date: validation.data.expiry_date?.toISOString(),
    created_by: user.id,
  };

  const { data, error } = await supabase
    .from("patient_insurances")
    .insert(dataToInsert)
    .select(selectWithDetails)
    .single();

  if (error) {
    console.error("Create Insurance Error:", error);
    throw new Error(
      "A server error occurred while creating the insurance record.",
    );
  }

  return { data: data as PatientInsuranceModel };
}

/**
 * Updates an existing patient insurance record with optimistic locking.
 */
export async function updatePatientInsurance(
  input: UpdateInsuranceInput,
): Promise<{ data?: PatientInsuranceModel; error?: ActionError }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required.");

  const validation = UpdateInsuranceSchema.safeParse(input);
  if (!validation.success) {
    return {
      error: {
        type: "validation",
        messageKey: "Errors.validationError",
        details: z.treeifyError(validation.error),
      },
    };
  }

  const { id, version, wantsToRemoveFile, ...restOfData } = validation.data;

  const { data: currentIns, error: fetchError } = await supabase
    .from("patient_insurances")
    .select("file_path")
    .eq("id", id)
    .single();

  if (fetchError) {
    return {
      error: {
        type: "notFound",
        messageKey: "Patient.Insurances.Errors.notFound",
      },
    };
  }
  const oldFilePath = currentIns.file_path;

  const dataToUpdate: PatientInsuranceUpdate = {
    ...restOfData,
    effective_date: restOfData.effective_date.toISOString(),
    expiry_date: restOfData.expiry_date
      ? restOfData.expiry_date.toISOString()
      : null,
    updated_by: user.id,
    version: version + 1,
  };

  const isReplacingFile = !!dataToUpdate.file_path;
  const isRemovingFile = wantsToRemoveFile && !isReplacingFile;

  if ((isReplacingFile || isRemovingFile) && oldFilePath) {
    const { error: deleteError } = await supabase.storage.from(BUCKET_NAME)
      .remove([oldFilePath]);
    if (deleteError) {
      console.error("Failed to delete old file from storage:", deleteError);
    }
  }

  if (isRemovingFile) {
    dataToUpdate.file_path = null;
    dataToUpdate.file_name = null;
    dataToUpdate.file_size = null;
    dataToUpdate.file_type = null;
  }

  const { data, error, count } = await supabase
    .from("patient_insurances")
    .update(dataToUpdate)
    .eq("id", id)
    .eq("version", version)
    .select(selectWithDetails)
    .single();

  if (count === 0 && !error) {
    return {
      error: { type: "conflict", messageKey: "Patient.Errors.versionMismatch" },
    };
  }

  if (error) {
    console.error("Update Insurance Error:", error);
    throw new Error(
      "A server error occurred while updating the insurance record.",
    );
  }
  return { data: data as PatientInsuranceModel };
}

/**
 * Deletes a patient insurance record and its associated file.
 */
export async function deletePatientInsurance(
  insuranceId: number,
): Promise<{ data?: { insuranceId: number }; error?: ActionError }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required.");

  const { data: insurance, error: fetchError } = await supabase
    .from("patient_insurances")
    .select("file_path, patient_id")
    .eq("id", insuranceId)
    .single();

  if (fetchError || !insurance) {
    return {
      error: {
        type: "notFound",
        messageKey: "Patient.Insurances.Errors.notFound",
      },
    };
  }

  if (insurance.file_path) {
    const { error: storageError } = await supabase.storage.from(BUCKET_NAME)
      .remove([insurance.file_path]);
    if (storageError) {
      console.error(
        `Failed to delete file from storage: ${storageError.message}`,
      );
    }
  }

  const { error: dbError } = await supabase.from("patient_insurances").delete()
    .eq("id", insuranceId);

  if (dbError) {
    console.error(`Failed to delete insurance record: ${dbError.message}`);
    throw new Error(
      "A server error occurred while deleting the insurance record.",
    );
  }

  return { data: { insuranceId } };
}

"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { MedicalDocumentTypeModel } from "@/types/data-models";

type MedicalDocumentTypePayload = Omit<
  MedicalDocumentTypeModel,
  "id" | "created_at" | "updated_at"
>;

// --- CREATE ---
export async function createMedicalDocumentType(
  payload: MedicalDocumentTypePayload
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("medical_document_types")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    console.error("Error creating medical document type:", error);
    return { error };
  }

  revalidatePath("/dashboard/settings/master-data");
  return { id: data.id };
}

// --- UPDATE ---
export async function updateMedicalDocumentType(
  id: number,
  payload: Partial<MedicalDocumentTypePayload>
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("medical_document_types")
    .update(payload)
    .eq("id", id);

  if (error) {
    console.error("Error updating medical document type:", error);
    return { error };
  }

  revalidatePath("/dashboard/settings/master-data");
  return { success: true };
}

// --- DELETE ---
export async function deleteMedicalDocumentType(id: number) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("medical_document_types")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting medical document type:", error);
    // Handle potential foreign key constraint errors
    if (error.code === "23503") {
      return {
        error: {
          message:
            "This document type is in use and cannot be deleted. Please reassign existing documents to another type first.",
          code: error.code,
        },
      };
    }
    return { error };
  }

  revalidatePath("/dashboard/settings/master-data");
  return { success: true };
}
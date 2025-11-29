"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { MedicalDocumentTypeModel } from "@/types/data-models";
import { getTargetLocales } from "@/i18n/locale-config";

type MedicalDocumentTypePayload = Omit<
  MedicalDocumentTypeModel,
  "id" | "created_at" | "updated_at"
>;

function getTargetLocalesFor(sourceLocale: string): string[] {
  return getTargetLocales(sourceLocale);
}

// --- CREATE ---
export async function createMedicalDocumentType(
  payload: MedicalDocumentTypePayload,
) {
  const supabase = await createClient();

  const insertPayload = {
    type_key: payload.type_key,
    name_translations: payload.name_translations
      ? {
        [payload.ai_source_locale ?? "en"]:
          payload.name_translations[payload.ai_source_locale ?? "en"],
      }
      : {},
    ai_source_locale: payload.ai_source_locale,
  };

  const { data, error } = await supabase
    .from("medical_document_types")
    .insert(insertPayload)
    .select("id")
    .single();

  if (error) {
    console.error("Error creating medical document type:", error);
    return { error };
  }

  const id = data.id;

  // Fire-and-forget translation for name_translations
  const src = payload.ai_source_locale ?? "en";
  const targets = getTargetLocalesFor(src);

  supabase.functions
    .invoke("translate_common", {
      body: {
        tableName: "medical_document_types",
        recordId: id,
        column: "name_translations",
        sourceLocale: src,
        targetLocales: targets,
      },
    })
    .catch((err) => {
      console.error("translate_admin on doc type create failed:", err);
    });

  revalidatePath("/dashboard/settings/master-data");
  return { id };
}

// --- UPDATE ---
export async function updateMedicalDocumentType(
  id: number,
  payload: Partial<MedicalDocumentTypePayload>,
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

  const src = payload.ai_source_locale ?? "en";
  const targets = getTargetLocalesFor(src);

  supabase.functions
    .invoke("translate_common", {
      body: {
        tableName: "medical_document_types",
        recordId: id,
        column: "name_translations",
        sourceLocale: src,
        targetLocales: targets,
      },
    })
    .catch((err) => {
      console.error("translate_admin on doc type update failed:", err);
    });

  revalidatePath("/dashboard/settings/master-data");
  return { success: true };
}

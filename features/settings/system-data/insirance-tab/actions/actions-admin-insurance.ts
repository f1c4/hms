"use server";

import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import { Database } from "@/types/database-custom";
import { revalidatePath } from "next/cache";

type InsuranceProviderInsert = Database["public"]["Tables"]["insurance_providers"]["Insert"];
type InsuranceProviderUpdate = Database["public"]["Tables"]["insurance_providers"]["Update"];
type InsurancePlanInsert = Database["public"]["Tables"]["insurance_plans"]["Insert"];
type InsurancePlanUpdate = Database["public"]["Tables"]["insurance_plans"]["Update"];

// --- Zod Schemas for Validation ---
const TranslationsSchema = z.record(z.string(), z.string()).refine(
  (translations) => translations.en && String(translations.en).trim() !== "",
  { message: "A default (English) translation is required." }
);

const ProviderSchema = z.object({
  name_translations: TranslationsSchema,
  contact_info: z.record(z.string(), z.any()).nullable().optional(),
});

const PlanSchema = z.object({
  provider_id: z.number().int().positive(),
  name_translations: TranslationsSchema,
  description_translations: TranslationsSchema.nullable().optional(),
  coverage_details: z.record(z.string(), z.any()).nullable().optional(),
});

// --- INSURANCE PROVIDER ACTIONS ---

export async function createInsuranceProvider(formData: InsuranceProviderInsert) {
  const validation = ProviderSchema.safeParse(formData);
  if (!validation.success) {
    return { error: { message: "Invalid input.", issues: validation.error.issues } };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("insurance_providers").insert(validation.data);
  if (error) {
    return { error: { message: "Database error: Could not create provider." } };
  }
  revalidatePath("/dashboard/settings/master-data");
  return { data: { message: "Provider created successfully." } };
}

export async function updateInsuranceProvider(id: number, formData: InsuranceProviderUpdate) {
  const validation = ProviderSchema.safeParse(formData);
  if (!validation.success) {
    return { error: { message: "Invalid input.", issues: validation.error.issues } };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("insurance_providers").update(validation.data).eq("id", id);
  if (error) {
    return { error: { message: "Database error: Could not update provider." } };
  }
  revalidatePath("/dashboard/settings/master-data");
  return { data: { message: "Provider updated successfully." } };
}

export async function deleteInsuranceProvider(id: number) {
  const supabase = await createClient();
  const { error } = await supabase.from("insurance_providers").delete().eq("id", id);
  if (error) {
    if (error.code === "23503") { // Foreign key violation
      return { error: { message: "Cannot delete a provider that has associated plans." } };
    }
    return { error: { message: "Database error: Could not delete provider." } };
  }
  revalidatePath("/dashboard/settings/master-data");
  return { data: { message: "Provider deleted successfully." } };
}

// --- INSURANCE PLAN ACTIONS ---

export async function createInsurancePlan(formData: InsurancePlanInsert) {
  const validation = PlanSchema.safeParse(formData);
  if (!validation.success) {
    return { error: { message: "Invalid input.", issues: validation.error.issues } };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("insurance_plans").insert(validation.data);
  if (error) {
    return { error: { message: "Database error: Could not create plan." } };
  }
  revalidatePath("/dashboard/settings/master-data");
  return { data: { message: "Plan created successfully." } };
}

export async function updateInsurancePlan(id: number, formData: InsurancePlanUpdate) {
  const validation = PlanSchema.safeParse(formData);
  if (!validation.success) {
    return { error: { message: "Invalid input.", issues: validation.error.issues } };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("insurance_plans").update(validation.data).eq("id", id);
  if (error) {
    return { error: { message: "Database error: Could not update plan." } };
  }
  revalidatePath("/dashboard/settings/master-data");
  return { data: { message: "Plan updated successfully." } };
}

export async function deleteInsurancePlan(id: number) {
  const supabase = await createClient();
  const { error } = await supabase.from("insurance_plans").delete().eq("id", id);
  if (error) {
    if (error.code === "23503") { // Foreign key violation
      return { error: { message: "Cannot delete a plan that is in use by a patient." } };
    }
    return { error: { message: "Database error: Could not delete plan." } };
  }
  revalidatePath("/dashboard/settings/master-data");
  return { data: { message: "Plan deleted successfully." } };
}
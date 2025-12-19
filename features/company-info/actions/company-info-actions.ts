"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { CompanyInfoTypeDb } from "@/types/data-models";
import {
    CompanyInfoServerInput,
    CompanyInfoServerSchema,
} from "../schemas/company-info-schema";

// --- FETCH COMPANY INFO ---
// Returns the first (and typically only) record from company_info
export async function getCompanyInfo(): Promise<
    CompanyInfoTypeDb["Row"] | null
> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("company_info")
        .select("*")
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error("Error fetching company info:", error);
        throw new Error("Could not fetch company info.");
    }

    return data;
}

// --- UPDATE COMPANY INFO (UPSERT) ---
// Updates existing record or creates new one if none exists
export async function updateCompanyInfo(formData: CompanyInfoServerInput) {
    const validation = CompanyInfoServerSchema.safeParse(formData);
    if (!validation.success) {
        return {
            error: {
                message: "Invalid input.",
                issues: validation.error.issues,
            },
        };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Check if a record exists
    const { data: existing } = await supabase
        .from("company_info")
        .select("id")
        .limit(1)
        .maybeSingle();

    if (existing) {
        // Update existing record
        const { error } = await supabase
            .from("company_info")
            .update({
                ...validation.data,
                updated_at: new Date().toISOString(),
                updated_by: user?.id,
            })
            .eq("id", existing.id);

        if (error) {
            console.error("Error updating company info:", error);
            return {
                error: {
                    message: "Database error: Could not update company info.",
                },
            };
        }
    } else {
        // Insert new record
        const { error } = await supabase
            .from("company_info")
            .insert({
                ...validation.data,
                created_by: user?.id,
            });

        if (error) {
            console.error("Error creating company info:", error);
            return {
                error: {
                    message: "Database error: Could not create company info.",
                },
            };
        }
    }

    revalidatePath("/dashboard/settings");
    return { data: { message: "Company info saved successfully." } };
}

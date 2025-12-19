"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { CompaniesTypeDb } from "@/types/data-models";
import {
    CompanyServerInput,
    CompanyServerSchema,
} from "../schemas/company-schema";

// --- FETCH ALL COMPANIES ---
export async function getCompanies(): Promise<CompaniesTypeDb["Row"][]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("companies")
        .select("*")
        .order("name", { ascending: true });

    if (error) {
        console.error("Error fetching companies:", error);
        throw new Error("Could not fetch companies.");
    }

    return data ?? [];
}

// --- CREATE COMPANY ---
export async function createCompany(
    formData: CompanyServerInput,
    options?: { skipRevalidate?: boolean },
) {
    const validation = CompanyServerSchema.safeParse(formData);
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

    const { data, error } = await supabase
        .from("companies")
        .insert({
            ...validation.data,
            created_by: user?.id,
        })
        .select("id, name") // Return the created company
        .single();

    if (error) {
        console.error("Error creating company:", error);
        return {
            error: { message: "Database error: Could not create company." },
        };
    }

    // Only revalidate when called from the companies management page
    if (!options?.skipRevalidate) {
        revalidatePath("/dashboard/companies");
    }

    return {
        data: { message: "Company created successfully.", company: data },
    };
}

// --- UPDATE COMPANY ---
export async function updateCompany(
    id: number,
    formData: CompanyServerInput,
) {
    const validation = CompanyServerSchema.partial().safeParse(formData);
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

    const { error } = await supabase
        .from("companies")
        .update({
            ...validation.data,
            updated_by: user?.id,
        })
        .eq("id", id);

    if (error) {
        console.error("Error updating company:", error);
        return {
            error: { message: "Database error: Could not update company." },
        };
    }

    revalidatePath("/dashboard/companies");
    return { data: { message: "Company updated successfully." } };
}

// --- DELETE COMPANY ---
export async function deleteCompany(id: number) {
    const supabase = await createClient();

    const { error } = await supabase.from("companies").delete().eq("id", id);

    if (error) {
        if (error.code === "23503") {
            return {
                error: {
                    message:
                        "Cannot delete a company that is linked to patients.",
                },
            };
        }
        console.error("Error deleting company:", error);
        return {
            error: { message: "Database error: Could not delete company." },
        };
    }

    revalidatePath("/dashboard/companies");
    return { data: { message: "Company deleted successfully." } };
}

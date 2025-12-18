"use server";

import { createClient } from "@/utils/supabase/server";
import { triggerEntityTranslation } from "@/lib/translation-actions";
import { TRANSLATION_ENTITIES } from "@/config/translation-entities";
import {
    ProfessionSchema,
    ProfessionUpdateSchema,
} from "../schema/profession-schema";

// --- CREATE ---
export async function createProfession(
    formData: { name: string; sourceLocale: string },
) {
    // Validate input
    const validation = ProfessionSchema.safeParse(formData);
    if (!validation.success) {
        return {
            error: {
                message: "Invalid input",
                issues: validation.error.issues,
            },
        };
    }

    const { name, sourceLocale } = validation.data;
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("professions")
        .insert({
            name_translations: { [sourceLocale]: name },
            ai_source_locale: sourceLocale,
            ai_translation_status: "pending",
        })
        .select("id")
        .single();

    if (error) {
        console.error("Error creating profession:", error);
        return {
            error: { message: "Database error: Could not create profession." },
        };
    }

    // Fire-and-forget translation
    triggerEntityTranslation({
        tableName: "professions",
        recordId: data.id,
        column: "name_translations",
        sourceLocale,
        entity: TRANSLATION_ENTITIES.profession,
    });

    return { id: data.id };
}

// --- UPDATE ---
export async function updateProfession(
    id: number,
    formData: { name?: string; sourceLocale?: string },
) {
    // Validate input
    const validation = ProfessionUpdateSchema.safeParse(formData);
    if (!validation.success) {
        return {
            error: {
                message: "Invalid input",
                issues: validation.error.issues,
            },
        };
    }

    const { name, sourceLocale } = validation.data;
    const supabase = await createClient();

    // Build update payload
    const updatePayload: Record<string, unknown> = {};

    if (name && sourceLocale) {
        // If name is provided, update the translation for the source locale
        // First, fetch current translations to merge
        const { data: current } = await supabase
            .from("professions")
            .select("name_translations")
            .eq("id", id)
            .single();

        const existingTranslations =
            (current?.name_translations as Record<string, string>) ?? {};

        updatePayload.name_translations = {
            ...existingTranslations,
            [sourceLocale]: name,
        };
        updatePayload.ai_source_locale = sourceLocale;
        updatePayload.ai_translation_status = "pending";
    }

    const { error } = await supabase
        .from("professions")
        .update(updatePayload)
        .eq("id", id);

    if (error) {
        console.error("Error updating profession:", error);
        return {
            error: { message: "Database error: Could not update profession." },
        };
    }

    // Fire-and-forget translation if name was updated
    if (name && sourceLocale) {
        triggerEntityTranslation({
            tableName: "professions",
            recordId: id,
            column: "name_translations",
            sourceLocale,
            entity: TRANSLATION_ENTITIES.profession,
        });
    }

    return { success: true };
}

// --- DELETE ---
export async function deleteProfession(id: number) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("professions")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Error deleting profession:", error);
        return {
            error: { message: "Database error: Could not delete profession." },
        };
    }

    return { success: true };
}

// --- GET ALL ---
export async function getProfessions() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("professions")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching professions:", error);
        return { error: { message: "Could not fetch professions." } };
    }

    return { data };
}

// --- GET BY ID ---
export async function getProfession(id: number) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("professions")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        console.error("Error fetching profession:", error);
        return { error: { message: "Profession not found." } };
    }

    return { data };
}

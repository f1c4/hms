"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { triggerEntityTranslation } from "@/lib/translation-actions";
import { TRANSLATION_ENTITIES } from "@/config/translation-entities";

import {
    ExaminationCategoryInsert,
    ExaminationCategoryModel,
    ExaminationCategoryUpdate,
    TRANSLATABLE_COLUMNS,
} from "../types";

import {
    type ExaminationCategoryCreatePayload,
    ExaminationCategoryCreateSchema,
    type ExaminationCategoryUpdatePayload,
    ExaminationCategoryUpdateSchema,
} from "../schemas";

// =============================================================================
// TYPES FOR ACTION RESPONSES
// =============================================================================

type ActionSuccess<T = void> = { data: T; error?: never };
type ActionError = {
    data?: never;
    error: { message: string; issues?: unknown[] };
};
type ActionResult<T = void> = ActionSuccess<T> | ActionError;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Trigger AI translation for all translatable columns.
 * Uses centralized translation action (fire-and-forget).
 */
function triggerTranslations(recordId: number, sourceLocale: string) {
    for (const column of TRANSLATABLE_COLUMNS) {
        triggerEntityTranslation({
            tableName: "examination_type_categories",
            recordId,
            column,
            sourceLocale,
            entity: TRANSLATION_ENTITIES.examination_category,
        });
    }
}

/**
 * Cast JSONB fields to typed Record objects.
 */
function toModel(row: Record<string, unknown>): ExaminationCategoryModel {
    return {
        ...row,
        name_translations: (row.name_translations as Record<string, string>) ??
            {},
    } as ExaminationCategoryModel;
}

// =============================================================================
// FETCH ALL
// =============================================================================

export async function getExaminationCategories(): Promise<
    ActionResult<ExaminationCategoryModel[]>
> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: { message: "Unauthorized" } };
    }

    const { data, error } = await supabase
        .from("examination_type_categories")
        .select("*")
        .order("id", { ascending: true });

    if (error) {
        console.error("Error fetching examination categories:", error);
        return {
            error: { message: "Failed to fetch examination categories." },
        };
    }

    return { data: data.map(toModel) };
}

// =============================================================================
// FETCH SINGLE
// =============================================================================

export async function getExaminationCategory(
    id: number,
): Promise<ActionResult<ExaminationCategoryModel>> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: { message: "Unauthorized" } };
    }

    const { data, error } = await supabase
        .from("examination_type_categories")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        console.error("Error fetching examination category:", error);
        return { error: { message: "Examination category not found." } };
    }

    return { data: toModel(data) };
}

// =============================================================================
// CREATE
// =============================================================================

export async function createExaminationCategory(
    payload: ExaminationCategoryCreatePayload,
): Promise<ActionResult<{ id: number }>> {
    const supabase = await createClient();

    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: { message: "Unauthorized" } };
    }

    // Validate payload
    const validation = ExaminationCategoryCreateSchema.safeParse(payload);
    if (!validation.success) {
        return {
            error: {
                message: "Invalid input.",
                issues: validation.error.issues,
            },
        };
    }

    const validData = validation.data;
    const sourceLocale = validData.ai_source_locale ?? "en";

    // Build insert payload - store only source locale initially
    const insertPayload: ExaminationCategoryInsert = {
        ai_source_locale: sourceLocale,
        ai_translation_status: "pending",
        created_by: user.id,
        name_translations: validData.name_translations[sourceLocale]
            ? { [sourceLocale]: validData.name_translations[sourceLocale] }
            : validData.name_translations,
    };

    const { data, error } = await supabase
        .from("examination_type_categories")
        .insert(insertPayload)
        .select("id")
        .single();

    if (error) {
        console.error("Error creating examination category:", error);
        return {
            error: { message: "Failed to create examination category." },
        };
    }

    // Trigger translations (fire-and-forget)
    triggerTranslations(data.id, sourceLocale);

    revalidatePath("/dashboard/settings");
    return { data: { id: data.id } };
}

// =============================================================================
// UPDATE
// =============================================================================

export async function updateExaminationCategory(
    id: number,
    payload: ExaminationCategoryUpdatePayload,
): Promise<ActionResult<{ message: string }>> {
    const supabase = await createClient();

    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: { message: "Unauthorized" } };
    }

    // Validate payload
    const validation = ExaminationCategoryUpdateSchema.safeParse(payload);
    if (!validation.success) {
        return {
            error: {
                message: "Invalid input.",
                issues: validation.error.issues,
            },
        };
    }

    const validData = validation.data;
    const sourceLocale = validData.ai_source_locale ?? "en";

    // Build update payload
    const updatePayload: ExaminationCategoryUpdate = {
        updated_at: new Date().toISOString(),
        updated_by: user.id,
        ai_translation_status: "pending",
    };

    // Map fields
    if (validData.ai_source_locale !== undefined) {
        updatePayload.ai_source_locale = validData.ai_source_locale;
    }

    // Translations - store only source locale
    if (validData.name_translations !== undefined) {
        updatePayload.name_translations =
            validData.name_translations[sourceLocale]
                ? { [sourceLocale]: validData.name_translations[sourceLocale] }
                : validData.name_translations;
    }

    const { error } = await supabase
        .from("examination_type_categories")
        .update(updatePayload)
        .eq("id", id);

    if (error) {
        console.error("Error updating examination category:", error);
        return {
            error: { message: "Failed to update examination category." },
        };
    }

    // Trigger translations
    triggerTranslations(id, sourceLocale);

    revalidatePath("/dashboard/settings");
    return { data: { message: "Examination category updated successfully." } };
}

// =============================================================================
// DELETE
// =============================================================================

/**
 * Deletes an examination category.
 * Note: This is a hard delete. Make sure no examination types reference this category
 * before deleting, or handle the foreign key constraint appropriately.
 */
export async function deleteExaminationCategory(
    id: number,
): Promise<ActionResult<{ message: string }>> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: { message: "Unauthorized" } };
    }

    // Check if any examination types are using this category
    const { data: examinationTypes, error: checkError } = await supabase
        .from("examination_types")
        .select("id, type_key")
        .eq("category_id", id)
        .limit(1);

    if (checkError) {
        console.error("Error checking category usage:", checkError);
        return {
            error: {
                message: "Failed to check if category is in use.",
            },
        };
    }

    if (examinationTypes && examinationTypes.length > 0) {
        return {
            error: {
                message:
                    "Cannot delete category. It is currently assigned to one or more examination types.",
            },
        };
    }

    const { error } = await supabase
        .from("examination_type_categories")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Error deleting examination category:", error);
        if (error.code === "23503") {
            return {
                error: {
                    message:
                        "Cannot delete category. It is referenced by examination types.",
                },
            };
        }
        return {
            error: { message: "Failed to delete examination category." },
        };
    }

    revalidatePath("/dashboard/settings");
    return { data: { message: "Examination category deleted successfully." } };
}

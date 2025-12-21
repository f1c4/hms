"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { triggerEntityTranslation } from "@/lib/translation-actions";
import { TRANSLATION_ENTITIES } from "@/config/translation-entities";

import {
    ExaminationTypeInsert,
    ExaminationTypeModel,
    ExaminationTypeUpdate,
    TRANSLATABLE_COLUMNS,
} from "../types/examination-types";

import {
    type ExaminationTypeCreatePayload,
    ExaminationTypeCreateSchema,
    type ExaminationTypeUpdatePayload,
    ExaminationTypeUpdateSchema,
} from "../schemas/examination-type-schemas";

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
            tableName: "examination_types",
            recordId,
            column,
            sourceLocale,
            entity: TRANSLATION_ENTITIES.examination_type,
        });
    }
}

/**
 * Cast JSONB fields to typed Record objects.
 */
function toModel(row: Record<string, unknown>): ExaminationTypeModel {
    return {
        ...row,
        name_translations: (row.name_translations as Record<string, string>) ??
            {},
        description_translations: row.description_translations as
            | Record<string, string>
            | null,
        preparation_instructions_translations: row
            .preparation_instructions_translations as
                | Record<string, string>
                | null,
    } as ExaminationTypeModel;
}

// =============================================================================
// FETCH ALL
// =============================================================================

export async function getExaminationTypes(
    includeInactive = false,
): Promise<ActionResult<ExaminationTypeModel[]>> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: { message: "Unauthorized" } };
    }

    let query = supabase
        .from("examination_types")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("id", { ascending: true });

    // By default, only fetch active examination types
    if (!includeInactive) {
        query = query.eq("is_active", true);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching examination types:", error);
        return { error: { message: "Failed to fetch examination types." } };
    }

    return { data: data.map(toModel) };
}

// =============================================================================
// FETCH SINGLE
// =============================================================================

export async function getExaminationType(
    id: number,
): Promise<ActionResult<ExaminationTypeModel>> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: { message: "Unauthorized" } };
    }

    const { data, error } = await supabase
        .from("examination_types")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        console.error("Error fetching examination type:", error);
        return { error: { message: "Examination type not found." } };
    }

    return { data: toModel(data) };
}

// =============================================================================
// CREATE
// =============================================================================

export async function createExaminationType(
    payload: ExaminationTypeCreatePayload,
): Promise<ActionResult<{ id: number }>> {
    const supabase = await createClient();

    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: { message: "Unauthorized" } };
    }

    // Validate payload
    const validation = ExaminationTypeCreateSchema.safeParse(payload);
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
    const insertPayload: ExaminationTypeInsert = {
        type_key: validData.type_key,
        duration_minutes: validData.duration_minutes,
        base_price: validData.base_price,
        category: validData.category,
        color: validData.color,
        sort_order: validData.sort_order,
        is_active: validData.is_active ?? true,
        requires_referral: validData.requires_referral ?? false,
        requires_fasting: validData.requires_fasting ?? false,
        requires_appointment: validData.requires_appointment ?? true,
        ai_source_locale: sourceLocale,
        ai_translation_status: "pending",
        created_by: user.id,
        name_translations: validData.name_translations[sourceLocale]
            ? { [sourceLocale]: validData.name_translations[sourceLocale] }
            : validData.name_translations,
        description_translations:
            validData.description_translations?.[sourceLocale]
                ? {
                    [sourceLocale]:
                        validData.description_translations[sourceLocale],
                }
                : validData.description_translations,
        preparation_instructions_translations:
            validData.preparation_instructions_translations?.[sourceLocale]
                ? {
                    [sourceLocale]:
                        validData
                            .preparation_instructions_translations[
                                sourceLocale
                            ],
                }
                : validData.preparation_instructions_translations,
    };

    const { data, error } = await supabase
        .from("examination_types")
        .insert(insertPayload)
        .select("id")
        .single();

    if (error) {
        console.error("Error creating examination type:", error);
        if (error.code === "23505") {
            return {
                error: {
                    message:
                        "An examination type with this key already exists.",
                },
            };
        }
        return { error: { message: "Failed to create examination type." } };
    }

    // Trigger translations (fire-and-forget)
    triggerTranslations(data.id, sourceLocale);

    revalidatePath("/dashboard/settings");
    return { data: { id: data.id } };
}

// =============================================================================
// UPDATE
// =============================================================================

export async function updateExaminationType(
    id: number,
    payload: ExaminationTypeUpdatePayload,
): Promise<ActionResult<{ message: string }>> {
    const supabase = await createClient();

    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: { message: "Unauthorized" } };
    }

    // Validate payload
    const validation = ExaminationTypeUpdateSchema.safeParse(payload);
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
    const updatePayload: ExaminationTypeUpdate = {
        updated_at: new Date().toISOString(),
        updated_by: user.id,
        ai_translation_status: "pending",
    };

    // Map fields
    if (validData.type_key !== undefined) {
        updatePayload.type_key = validData.type_key;
    }
    if (validData.duration_minutes !== undefined) {
        updatePayload.duration_minutes = validData.duration_minutes;
    }
    if (validData.base_price !== undefined) {
        updatePayload.base_price = validData.base_price;
    }
    if (validData.category !== undefined) {
        updatePayload.category = validData.category;
    }
    if (validData.color !== undefined) updatePayload.color = validData.color;
    if (validData.sort_order !== undefined) {
        updatePayload.sort_order = validData.sort_order;
    }
    if (validData.is_active !== undefined) {
        updatePayload.is_active = validData.is_active;
    }
    if (validData.requires_referral !== undefined) {
        updatePayload.requires_referral = validData.requires_referral;
    }
    if (validData.requires_fasting !== undefined) {
        updatePayload.requires_fasting = validData.requires_fasting;
    }
    if (validData.requires_appointment !== undefined) {
        updatePayload.requires_appointment = validData.requires_appointment;
    }
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
    if (validData.description_translations !== undefined) {
        updatePayload.description_translations =
            validData.description_translations?.[sourceLocale]
                ? {
                    [sourceLocale]:
                        validData.description_translations[sourceLocale],
                }
                : validData.description_translations;
    }
    if (validData.preparation_instructions_translations !== undefined) {
        updatePayload.preparation_instructions_translations =
            validData.preparation_instructions_translations?.[sourceLocale]
                ? {
                    [sourceLocale]:
                        validData
                            .preparation_instructions_translations[
                                sourceLocale
                            ],
                }
                : validData.preparation_instructions_translations;
    }

    const { error } = await supabase
        .from("examination_types")
        .update(updatePayload)
        .eq("id", id);

    if (error) {
        console.error("Error updating examination type:", error);
        if (error.code === "23505") {
            return {
                error: {
                    message:
                        "An examination type with this key already exists.",
                },
            };
        }
        return { error: { message: "Failed to update examination type." } };
    }

    // Trigger translations
    triggerTranslations(id, sourceLocale);

    revalidatePath("/dashboard/settings");
    return { data: { message: "Examination type updated successfully." } };
}

// =============================================================================
// DEACTIVATE (Soft Delete)
// =============================================================================

/**
 * Deactivates an examination type.
 * Use when clinic loses capability to perform this examination
 * (staff unavailable, equipment issues, license expired, etc.)
 */
export async function deactivateExaminationType(
    id: number,
): Promise<ActionResult<{ message: string }>> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: { message: "Unauthorized" } };
    }

    const { error } = await supabase
        .from("examination_types")
        .update({
            is_active: false,
            updated_at: new Date().toISOString(),
            updated_by: user.id,
        })
        .eq("id", id);

    if (error) {
        console.error("Error deactivating examination type:", error);
        return { error: { message: "Failed to deactivate examination type." } };
    }

    revalidatePath("/dashboard/settings");
    return { data: { message: "Examination type deactivated." } };
}

// =============================================================================
// REACTIVATE
// =============================================================================

/**
 * Reactivates a previously deactivated examination type.
 * Use when clinic regains capability to perform this examination.
 */
export async function reactivateExaminationType(
    id: number,
): Promise<ActionResult<{ message: string }>> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: { message: "Unauthorized" } };
    }

    const { error } = await supabase
        .from("examination_types")
        .update({
            is_active: true,
            updated_at: new Date().toISOString(),
            updated_by: user.id,
        })
        .eq("id", id);

    if (error) {
        console.error("Error reactivating examination type:", error);
        return { error: { message: "Failed to reactivate examination type." } };
    }

    revalidatePath("/dashboard/settings");
    return { data: { message: "Examination type reactivated." } };
}

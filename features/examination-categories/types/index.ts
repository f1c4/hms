import { Database } from "@/types/database";

// =============================================================================
// DATABASE TYPES (from generated Supabase types)
// =============================================================================

export type ExaminationCategoryRow =
    Database["public"]["Tables"]["examination_type_categories"]["Row"];

export type ExaminationCategoryInsert =
    Database["public"]["Tables"]["examination_type_categories"]["Insert"];

export type ExaminationCategoryUpdate =
    Database["public"]["Tables"]["examination_type_categories"]["Update"];

// =============================================================================
// CLIENT MODEL (with typed JSONB fields)
// =============================================================================

/**
 * Client-friendly model with properly typed translation fields.
 * Use this in components and hooks.
 */
export type ExaminationCategoryModel =
    & Omit<ExaminationCategoryRow, "name_translations">
    & {
        name_translations: Record<string, string>;
    };

// =============================================================================
// TRANSLATABLE COLUMNS
// =============================================================================

/**
 * List of columns that support translations.
 * Used by server actions to trigger AI translation.
 */
export const TRANSLATABLE_COLUMNS = ["name_translations"] as const;

export type TranslatableColumn = (typeof TRANSLATABLE_COLUMNS)[number];

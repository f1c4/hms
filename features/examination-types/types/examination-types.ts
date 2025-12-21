import { Database } from "@/types/database";

// =============================================================================
// DATABASE TYPES (from generated Supabase types)
// =============================================================================

export type ExaminationTypeRow =
    Database["public"]["Tables"]["examination_types"]["Row"];

export type ExaminationTypeInsert =
    Database["public"]["Tables"]["examination_types"]["Insert"];

export type ExaminationTypeUpdate =
    Database["public"]["Tables"]["examination_types"]["Update"];

// =============================================================================
// CLIENT MODEL (with typed JSONB fields)
// =============================================================================

/**
 * Client-friendly model with properly typed translation fields.
 * Use this in components and hooks.
 */
export type ExaminationTypeModel =
    & Omit<
        ExaminationTypeRow,
        | "name_translations"
        | "description_translations"
        | "preparation_instructions_translations"
    >
    & {
        name_translations: Record<string, string>;
        description_translations: Record<string, string> | null;
        preparation_instructions_translations: Record<string, string> | null;
    };

// =============================================================================
// TRANSLATABLE COLUMNS
// =============================================================================

/**
 * List of columns that support translations.
 * Used by server actions to trigger AI translation.
 */
export const TRANSLATABLE_COLUMNS = [
    "name_translations",
    "description_translations",
    "preparation_instructions_translations",
] as const;

export type TranslatableColumn = (typeof TRANSLATABLE_COLUMNS)[number];

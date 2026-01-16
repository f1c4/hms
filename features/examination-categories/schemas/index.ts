import { z } from "zod";

// =============================================================================
// SHARED SCHEMAS
// =============================================================================

/**
 * Schema for translation JSONB fields.
 * Requires at least one locale to be present.
 */
const TranslationsSchema = z.record(z.string(), z.string()).refine(
    (translations) => Object.keys(translations).length > 0,
    { message: "At least one translation is required." },
);

// =============================================================================
// CREATE SCHEMA
// =============================================================================

/**
 * Schema for creating a new examination category.
 * Used for server-side validation with safeParse.
 */
export const ExaminationCategoryCreateSchema = z.object({
    // Required fields
    name_translations: TranslationsSchema,

    // Translation metadata
    ai_source_locale: z.string().min(2).max(10).optional().default("en"),
});

export type ExaminationCategoryCreatePayload = z.infer<
    typeof ExaminationCategoryCreateSchema
>;

// =============================================================================
// UPDATE SCHEMA
// =============================================================================

/**
 * Schema for updating an examination category.
 * All fields are optional, but at least one must be provided.
 */
export const ExaminationCategoryUpdateSchema = ExaminationCategoryCreateSchema
    .partial().refine(
        (data) => Object.keys(data).length > 0,
        { message: "At least one field must be provided for update" },
    );

export type ExaminationCategoryUpdatePayload = z.infer<
    typeof ExaminationCategoryUpdateSchema
>;

// =============================================================================
// CLIENT FORM SCHEMA (for UI forms with i18n validation messages)
// =============================================================================

/**
 * Client-side form schema factory.
 * Accepts a translation function for localized error messages.
 */
export const ExaminationCategoryFormSchema = (t: (key: string) => string) =>
    z.object({
        name: z
            .string()
            .min(1, t("nameRequired"))
            .max(100, t("nameMaxLength")),
    });

export type ExaminationCategoryFormInput = z.infer<
    ReturnType<typeof ExaminationCategoryFormSchema>
>;

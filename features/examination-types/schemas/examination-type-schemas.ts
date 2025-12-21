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

/**
 * Optional translations schema (can be null or empty).
 */
const OptionalTranslationsSchema = z
    .record(z.string(), z.string())
    .nullable()
    .optional();

// =============================================================================
// CREATE SCHEMA
// =============================================================================

/**
 * Schema for creating a new examination type.
 * Used for server-side validation with safeParse.
 */
export const ExaminationTypeCreateSchema = z.object({
    // Required fields
    type_key: z
        .string()
        .min(1, "Type key is required")
        .max(50, "Type key must be 50 characters or less")
        .regex(
            /^[a-z0-9_]+$/,
            "Type key must contain only lowercase letters, numbers, and underscores",
        ),
    name_translations: TranslationsSchema,
    duration_minutes: z
        .number()
        .int()
        .min(1, "Duration must be at least 1 minute")
        .max(480, "Duration cannot exceed 480 minutes (8 hours)"),

    // Optional fields
    description_translations: OptionalTranslationsSchema,
    preparation_instructions_translations: OptionalTranslationsSchema,
    base_price: z.number().min(0, "Price cannot be negative").nullable()
        .optional(),
    category: z.string().max(50).nullable().optional(),
    color: z
        .string()
        .regex(
            /^#[0-9A-Fa-f]{6}$/,
            "Color must be a valid hex code (e.g., #3B82F6)",
        )
        .nullable()
        .optional(),
    sort_order: z.number().int().nullable().optional(),
    is_active: z.boolean().optional().default(true),
    requires_referral: z.boolean().optional().default(false),
    requires_fasting: z.boolean().optional().default(false),
    requires_appointment: z.boolean().optional().default(true),

    // Translation metadata
    ai_source_locale: z.string().min(2).max(10).optional().default("en"),
});

export type ExaminationTypeCreatePayload = z.infer<
    typeof ExaminationTypeCreateSchema
>;

// =============================================================================
// UPDATE SCHEMA
// =============================================================================

/**
 * Schema for updating an examination type.
 * All fields are optional, but at least one must be provided.
 */
export const ExaminationTypeUpdateSchema = ExaminationTypeCreateSchema.partial()
    .refine(
        (data) => Object.keys(data).length > 0,
        { message: "At least one field must be provided for update" },
    );

export type ExaminationTypeUpdatePayload = z.infer<
    typeof ExaminationTypeUpdateSchema
>;

// =============================================================================
// CLIENT FORM SCHEMA (for UI forms with i18n validation messages)
// =============================================================================

/**
 * Client-side form schema factory.
 * Accepts a translation function for localized error messages.
 */
export const ExaminationTypeFormSchema = (t: (key: string) => string) =>
    z.object({
        typeKey: z
            .string()
            .min(1, t("typeKeyRequired"))
            .max(50, t("typeKeyMaxLength"))
            .regex(/^[a-z0-9_]+$/, t("typeKeyFormat")),
        name: z.string().min(1, t("nameRequired")).max(100, t("nameMaxLength")),
        description: z.string().max(500, t("descriptionMaxLength")).optional(),
        preparationInstructions: z
            .string()
            .max(1000, t("preparationMaxLength"))
            .optional(),
        durationMinutes: z
            .number()
            .int()
            .min(1, t("durationMin"))
            .max(480, t("durationMax")),
        basePrice: z.number().min(0, t("priceMin")).optional(),
        category: z.string().max(50).optional(),
        color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, t("colorFormat"))
            .optional(),
        // Remove .default() - form provides explicit defaultValues
        isActive: z.boolean(),
        requiresReferral: z.boolean(),
        requiresFasting: z.boolean(),
        requiresAppointment: z.boolean(),
    });

export type ExaminationTypeFormInput = z.infer<
    ReturnType<typeof ExaminationTypeFormSchema>
>;

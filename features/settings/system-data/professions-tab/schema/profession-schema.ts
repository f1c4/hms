import { z } from "zod";

/**
 * Schema for profession name validation.
 * Used for both client and server-side validation.
 */
export const ProfessionSchema = z.object({
    name: z
        .string()
        .min(1, { message: "Profession name is required" })
        .max(50, { message: "Profession name must be 50 characters or less" }),
    sourceLocale: z.string().min(2).max(10),
});

export type ProfessionFormData = z.infer<typeof ProfessionSchema>;

/**
 * Schema for updating a profession.
 * All fields are optional except we need at least one.
 */
export const ProfessionUpdateSchema = ProfessionSchema.partial().refine(
    (data) => data.name !== undefined || data.sourceLocale !== undefined,
    { message: "At least one field must be provided for update" },
);

export type ProfessionUpdateData = z.infer<typeof ProfessionUpdateSchema>;

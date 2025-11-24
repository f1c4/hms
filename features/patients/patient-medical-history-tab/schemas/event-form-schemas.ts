import { z } from "zod";

// Schema for the FORM -- used by the resolver.
// Describes the data structure inside the form.
export const MedicalHistoryEventFormSchema = (t: (key: string) => string) =>
    z.object({
        title: z
            .string({ error: t("eventTitleRequired") })
            .min(3, { message: t("eventTitleMinLength") })
            .max(100, { message: t("eventTitleMaxLength") }),
        event_date: z.date({ error: t("eventDateRequired") }),
        diagnoses: z
            .array(
                z.object({
                    value: z.string(),
                    label: z.string(),
                }),
            )
            .optional()
            .default([]), // Default to empty array
        notes: z.string().max(500, { message: t("notesMaxLength") }).optional(),
        version: z.number().min(1).optional(),
    });

// Type for the form's state (input)
export type MedicalHistoryEventFormInput = z.input<
    ReturnType<typeof MedicalHistoryEventFormSchema>
>;

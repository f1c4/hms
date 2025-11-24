import { z } from "zod";

// Base schema for the event data
const MedicalHistoryEventBaseSchema = z.object({
    title: z.string(),
    event_date: z.date(),
    notes: z.string().optional(),
    diagnoses: z.array(z.string()).optional().default([]),
});

// Schema for the 'createMedicalHistoryEvent' server action.
export const CreateMedicalHistoryEventSchema = MedicalHistoryEventBaseSchema
    .extend({
        patientId: z.number(),
        ai_source_locale: z.string(),
    });

// Schema for the 'updateMedicalHistoryEvent' server action.
export const UpdateMedicalHistoryEventSchema = MedicalHistoryEventBaseSchema
    .extend({
        id: z.number(),
        version: z.number(),
        ai_source_locale: z.string(),
    });

export type CreateMedicalHistoryEventInput = z.infer<
    typeof CreateMedicalHistoryEventSchema
>;
export type UpdateMedicalHistoryEventInput = z.infer<
    typeof UpdateMedicalHistoryEventSchema
>;

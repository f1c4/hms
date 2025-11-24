import { z } from "zod";

// Base schema for the document
const MedicalDocumentBaseSchema = z.object({
  documentType: z.number(),
  documentDate: z.date(),
  notes: z.string().optional(),
  diagnoses: z.array(z.string()).optional().default([]),
});

// Schema for the file details after upload.
const FileSchema = z.object({
  filePath: z.string(),
  fileName: z.string(),
  fileSize: z.number(),
  fileType: z.string(),
});

// Schema for the 'createPatientMedicalDocument' server action.
export const CreateMedicalDocumentSchema = MedicalDocumentBaseSchema.extend({
  patientId: z.number(),
  eventId: z.number(),
  ai_source_locale: z.string(),
  file: FileSchema,
});

// Schema for the 'updatePatientMedicalDocument' server action.
export const UpdateMedicalDocumentSchema = MedicalDocumentBaseSchema.extend({
  id: z.number(),
  version: z.number(),
  ai_source_locale: z.string(),
  file: FileSchema.optional(),
  wantsToRemoveFile: z.boolean().optional(),
});

export type CreateMedicalDocumentInput = z.infer<
  typeof CreateMedicalDocumentSchema
>;
export type UpdateMedicalDocumentInput = z.infer<
  typeof UpdateMedicalDocumentSchema
>;
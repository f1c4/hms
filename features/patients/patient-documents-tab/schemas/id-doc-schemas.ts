import * as z from "zod";

// This is the base schema, safe for server use.
// It does NOT include the 'file' field.
export const IdDocumentBaseSchema = z.object({
  documentType: z.number(),
  documentNumber: z.string(),
  issueDate: z.date(),
  expiryDate: z.date(),
  filePath: z.string().nullable().optional(),
  fileName: z.string().nullable().optional(),
  fileSize: z.number().nullable().optional(),
  fileType: z.string().nullable().optional(),
});

// Schema for the 'createPatientIdDocument' server action
export const CreateIdDocumentSchema = IdDocumentBaseSchema.extend({
  patientId: z.number(),
});

// Schema for the 'updatePatientIdDocument' server action
export const UpdateIdDocumentSchema = IdDocumentBaseSchema.extend({
  id: z.number(),
  version: z.number(),
  wantsToRemoveFile: z.boolean().optional(),
});

export type CreateIdDocumentInput = z.infer<typeof CreateIdDocumentSchema>;
export type UpdateIdDocumentInput = z.infer<typeof UpdateIdDocumentSchema>;
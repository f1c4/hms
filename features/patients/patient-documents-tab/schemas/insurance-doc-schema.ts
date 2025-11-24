import * as z from "zod";

// This is the base schema for insurance data, safe for server use.
// It does not include the raw 'file' field but has fields for file metadata.
export const InsuranceBaseSchema = z.object({
  plan_id: z.number(),
  policy_number: z.string(),
  lbo_number: z.string().optional().nullable(),
  effective_date: z.date(),
  expiry_date: z.date().optional().nullable(),
  is_active: z.boolean(),
  file_path: z.string().optional().nullable(),
  file_name: z.string().optional().nullable(),
  file_size: z.number().optional().nullable(),
  file_type: z.string().optional().nullable(),
});

// Schema for the 'createPatientInsurance' server action
export const CreateInsuranceSchema = InsuranceBaseSchema.extend({
  patient_id: z.number(),
});
export type CreateInsuranceInput = z.infer<typeof CreateInsuranceSchema>;

// Schema for the 'updatePatientInsurance' server action
export const UpdateInsuranceSchema = InsuranceBaseSchema.extend({
  id: z.number(),
  version: z.number(),
  wantsToRemoveFile: z.boolean().optional(),
});
export type UpdateInsuranceInput = z.infer<typeof UpdateInsuranceSchema>;
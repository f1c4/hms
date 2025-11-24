"use client";

import { z } from "zod";

// Schema for the React Hook Form state.
export const MedicalDocumentClientSchema = (t: (key: string) => string) =>
  z.object({
    documentType: z
      .number({ error: t("docTypeRequired") })
      .min(1, { message: t("docTypeRequired") }),
    documentDate: z.date({ error: t("docDateRequired") }),
    notes: z
      .string()
      .max(500, { message: t("notesMaxLength") })
      .optional(),
    diagnoses: z
      .array(
        z.object({
          value: z.string(),
          label: z.string(),
        })
      )
      .optional(),
    file: z
      .lazy(() =>
        typeof window === "undefined"
          ? z.any().optional()
          : z.instanceof(FileList).optional()
      ),
    wantsToRemoveFile: z.boolean().optional(),
    version: z.number().optional(),
  });

export type MedicalDocumentFormInput = z.infer<
  ReturnType<typeof MedicalDocumentClientSchema>
>;
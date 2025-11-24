"use client";

import * as z from "zod";

// Schema for React Hook Form's internal state.
// It uses Date objects and adds the browser-only 'file' field.
export const IdDocumentClientSchema = (t: (key: string) => string) =>
  z.object({
    documentType: z.number().min(1, { message: t("documentTypeRequired") }),
    documentNumber: z.string().min(1, { message: t("documentNumberRequired") }).max(50, { message: t("documentNumberTooLong") }),
    issueDate: z.date().optional(),
    expiryDate: z.date().optional(),
    file: z.lazy(() =>
      typeof window === "undefined"
        ? z.any().optional()
        : z.instanceof(FileList).optional()
    ),
    wantsToRemoveFile: z.boolean().optional(),
  })
  .refine((data) => data.issueDate, {
    message: t("issueDateRequired"),
    path: ["issueDate"],
  })
  .refine((data) => data.expiryDate, {
    message: t("expiryDateRequired"),
    path: ["expiryDate"],
  })
  .refine(
    (data) => {
      if (data.issueDate && data.expiryDate) {
        return data.expiryDate > data.issueDate;
      }
      return true;
    },
    {
      message: t("expiryDateAfterIssueDate"),
      path: ["expiryDate"],
    }
  ).refine(
    (data) => {
      if (data.expiryDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return data.expiryDate >= today;
      }
      return true;
    },
    {
      message: t("documentExpired"),
      path: ["expiryDate"],
    }
  );

export type IdDocumentFormInput = z.infer<ReturnType<typeof IdDocumentClientSchema>>;
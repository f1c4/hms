import { z } from "zod";

// Schema for the insurance form's client-side state.
// It uses Date objects and includes fields for file management.
export const InsuranceClientSchema = (t: (key: string) => string) =>
  z.object({
    providerId: z.number({ error: t("providerRequired") }).min(1, t("providerRequired")),
    planId: z.number({ error: t("planRequired") }).min(1, t("planRequired")),
    policyNumber: z.string().min(1, t("policyNumberRequired")),
    lboNumber: z.string().optional(),
    effectiveDate: z.date().optional(),
    expiryDate: z.date().optional(),
    file: z.lazy(() =>
      typeof window === "undefined"
        ? z.any().optional()
        : z.instanceof(FileList).optional()
    ),
    wantsToRemoveFile: z.boolean().optional(),
  })
  .refine((data) => data.effectiveDate, {
    message: t("effectiveDateRequired"),
    path: ["effectiveDate"],
  })
  .refine((data) => data.expiryDate, {
    message: t("expiryDateRequired"),
    path: ["expiryDate"],
  })
  .refine(
    (data) => {
      if (data.effectiveDate && data.expiryDate) {
        return data.expiryDate > data.effectiveDate;
      }
      return true;
    },
    {
      message: t("expiryDateAfterEffectiveDate"),
      path: ["expiryDate"],
    }
  )

export type InsuranceFormInput = z.infer<
  ReturnType<typeof InsuranceClientSchema>
>;
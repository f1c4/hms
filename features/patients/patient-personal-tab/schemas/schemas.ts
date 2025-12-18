import * as z from "zod";

export const PatientPersonalFormSchema = (t: (key: string) => string) =>
  z.object({
    parentName: z
      .string()
      .max(50, { message: t("parentNameMaxLength") })
      .optional()
      .nullable(),
    birthCityId: z
      .number()
      .optional()
      .nullable(),
    birthCountryId: z
      .number()
      .optional()
      .nullable(),
    maritalStatus: z.string().optional().nullable(),
    professionId: z
      .number()
      .optional()
      .nullable(),
    educationLevel: z
      .string()
      .max(50, { message: t("educationLevelMaxLength") })
      .optional()
      .nullable(),
    livingArrangement: z
      .string()
      .max(50, { message: t("livingArrangementMaxLength") })
      .optional()
      .nullable(),
    employerId: z
      .number()
      .optional()
      .nullable(),
    employmentStatus: z
      .string()
      .max(50, { message: t("employmentStatusMaxLength") })
      .optional()
      .nullable(),
  });

export type PatientPersonalFormType = z.infer<
  ReturnType<typeof PatientPersonalFormSchema>
>;

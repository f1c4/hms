import * as z from "zod";

export const PatientRiskFormSchema = (t: (key: string) => string) =>
  z.object({
    gender: z.string().max(20, { message: t("genderMax") }).optional().nullable(),

    weight: z
      .union([
        z.number(),
        z.string().transform((val) => (val === "" ? null : Number(val))),
        z.null(),
      ])
      .refine(
        (val) => val === null || (typeof val === "number" && val >= 1 && val <= 500),
        { message: t("weightMin") }
      )
      .nullable()
      .optional(),

    height: z
      .union([
        z.number(),
        z.string().transform((val) => (val === "" ? null : Number(val))),
        z.null(),
      ])
      .refine(
        (val) => val === null || (typeof val === "number" && val >= 30 && val <= 300),
        { message: t("heightMin") }
      )
      .nullable()
      .optional(),

    waistCircumference: z
      .union([
        z.number(),
        z.string().transform((val) => (val === "" ? null : Number(val))),
        z.null(),
      ])
      .refine(
        (val) => val === null || (typeof val === "number" && val >= 10 && val <= 200),
        { message: t("waistCircumferenceMin") }
      )
      .nullable()
      .optional(),

    bloodType: z
      .string()
      .max(10, { message: t("bloodTypeMaxLength") })
      .optional()
      .nullable(),

    stressLevel: z.string().nullable().optional(),
    physicalActivityLevel: z.string().nullable().optional(),
    smokingStatus: z.string().nullable().optional(),
    alcoholConsumption: z.string().nullable().optional(),
  });

type PatientRiskSchemaType = ReturnType<typeof PatientRiskFormSchema>;

// Type for the raw form values (what react-hook-form uses)
export type PatientRiskFormInput = z.input<PatientRiskSchemaType>;

// Type for the validated form output (what onSubmit receives)
export type PatientRiskFormOutput = z.output<PatientRiskSchemaType>;
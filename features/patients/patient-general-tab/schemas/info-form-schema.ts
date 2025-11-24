import * as z from "zod";

export const PatientGeneralFormSchema = (t: (key: string) => string) =>
  z.object({
    firstName: z
      .string()
      .min(2, { message: t("firstNameMin") })
      .max(50, { message: t("firstNameMax") }),

    lastName: z
      .string()
      .min(2, { message: t("lastNameMin") })
      .max(50, { message: t("lastNameMax") }),

    email: z.union([
      z.email({ message: t("emailInvalid") }),
      z.string().length(0),
    ])
      .transform((val) => val === "" ? null : val)
      .nullable()
      .optional(),

    dateOfBirth: z.date({ message: t("dateOfBirthRequired") }),

    residenceAddress: z.string()
      .max(150, { message: t("addressMax") })
      .transform((val) => val === "" ? null : val)
      .nullable()
      .optional(),

    residenceCityId: z.number().optional().nullable(),
    residenceCountryId: z.number().optional().nullable(),
    citizenshipCountryId: z.number().optional().nullable(),

    phone: z.string()
      .max(30, { message: t("phoneMax") })
      .transform((val) => val === "" ? null : val)
      .nullable()
      .optional(),

    nationalIdNumber: z.string()
      .regex(/^\d*$/, { message: t("mustBeDigits") })
      .transform((val) => val === "" ? null : val)
      .nullable()
      .optional(),

    emergencyContactName: z.string()
      .max(100, { message: t("emergencyContactNameMax") })
      .transform((val) => val === "" ? null : val)
      .nullable()
      .optional(),

    emergencyContactPhone: z.string()
      .max(50, { message: t("emergencyContactPhoneMax") })
      .transform((val) => val === "" ? null : val)
      .nullable()
      .optional(),

    emergencyContactRelation: z.string()
      .max(50, { message: t("emergencyContactRelationMax") })
      .transform((val) => val === "" ? null : val)
      .nullable()
      .optional(),
  });

type PatientGeneralSchemaType = ReturnType<typeof PatientGeneralFormSchema>;
export type PatientGeneralFormInput = z.input<PatientGeneralSchemaType>;
export type PatientGeneralFormOutput = z.output<PatientGeneralSchemaType>;

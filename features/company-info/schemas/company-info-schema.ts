import { z } from "zod";

// Client-side validation schema with translated error messages
export const CompanyInfoFormSchema = (t: (key: string) => string) =>
    z.object({
        name: z.string().min(1, t("nameRequired")).max(100, t("nameMaxLength")),
        tin: z.string().max(50, t("tinMaxLength")).optional().nullable(),
        vat: z.string().max(50, t("vatMaxLength")).optional().nullable(),
        registration_number: z.string().max(
            50,
            t("registrationNumberMaxLength"),
        ).optional().nullable(),
        address: z.string().max(255, t("addressMaxLength")).optional()
            .nullable(),
        city_id: z.number().optional().nullable(),
        country_id: z.number().optional().nullable(),
        phone: z.string().max(50, t("phoneMaxLength")).optional().nullable(),
        email: z.string().email(t("invalidEmail")).max(255, t("emailMaxLength"))
            .optional().nullable().or(z.literal("")),
        website: z.string().max(255, t("websiteMaxLength")).optional()
            .nullable().or(z.literal("")),
        description: z.string().max(500, t("descriptionMaxLength")).optional()
            .nullable(),
    });

export type CompanyInfoFormInput = z.input<
    ReturnType<typeof CompanyInfoFormSchema>
>;

// Server-side validation schema
export const CompanyInfoServerSchema = z.object({
    name: z.string().min(1, "Company name is required.").max(100),
    tin: z.string().max(50).nullable().optional(),
    vat: z.string().max(50).nullable().optional(),
    registration_number: z.string().max(50).nullable().optional(),
    address: z.string().max(255).nullable().optional(),
    city_id: z.number().nullable().optional(),
    country_id: z.number().nullable().optional(),
    phone: z.string().max(50).nullable().optional(),
    email: z.string().email().max(255).nullable().optional().or(z.literal("")),
    website: z.string().max(255).nullable().optional().or(z.literal("")),
    description: z.string().max(500).nullable().optional(),
});

export type CompanyInfoServerInput = z.infer<typeof CompanyInfoServerSchema>;

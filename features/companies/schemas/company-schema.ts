import { z } from "zod";

// Client-side validation schema
export const CompanyFormSchema = (t: (key: string) => string) =>
    z.object({
        name: z.string().min(1, t("nameRequired")),
        tin: z.string().optional().nullable(),
        vat: z.string().optional().nullable(),
        registration_number: z.string().optional().nullable(),
        address: z.string().optional().nullable(),
        city_id: z.number().optional().nullable(),
        country_id: z.number().optional().nullable(),
        phone: z.string().optional().nullable(),
        email: z.email(t("invalidEmail")).optional().nullable().or(
            z.literal(""),
        ),
        // Changed from URL validation to simple string with max 50 chars
        website: z.string().max(50, t("websiteMaxLength")).optional().nullable()
            .or(
                z.literal(""),
            ),
        type: z.string().default("company"),
        discount_percentage: z.coerce.number().min(0).max(100).default(0),
        is_partner: z.boolean().default(false),
    });

export type CompanyFormInput = z.input<ReturnType<typeof CompanyFormSchema>>;

// Server-side validation schema
export const CompanyServerSchema = z.object({
    name: z.string().min(1, "Company name is required."),
    tin: z.string().nullable().optional(),
    vat: z.string().nullable().optional(),
    registration_number: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    city_id: z.number().nullable().optional(),
    country_id: z.number().nullable().optional(),
    phone: z.string().nullable().optional(),
    email: z.email().nullable().optional().or(z.literal("")),
    // Changed from URL validation to simple string with max 50 chars
    website: z.string().max(50).nullable().optional().or(z.literal("")),
    type: z.string().default("company"),
    discount_percentage: z.coerce.number().min(0).max(100).default(0),
    is_partner: z.boolean().default(false),
});

export type CompanyServerInput = z.infer<typeof CompanyServerSchema>;

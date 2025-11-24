import { z } from "zod";

export const ProviderClientSchema = (t: (key: string) => string) =>
  z.object({
    // We'll collect the primary (English) name and transform it into the
    // name_translations object in the mutation hook.
    name: z.string().min(1, t("providerNameRequired")),

    // For the UI, a simple string/textarea is easiest for contact info.
    // This can be expanded to a structured form later if needed.
    contactInfo: z.string().optional(),
  });

export type ProviderFormInput = z.infer<
  ReturnType<typeof ProviderClientSchema>
>;
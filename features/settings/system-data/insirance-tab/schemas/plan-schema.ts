import { z } from "zod";

export const PlanClientSchema = (t: (key: string) => string) =>
  z.object({
    // We'll collect the primary (English) name and transform it in the mutation hook.
    name: z.string().min(1, t("planNameRequired")),

    // The description is optional.
    description: z.string().optional(),
  });

export type PlanFormInput = z.infer<ReturnType<typeof PlanClientSchema>>;
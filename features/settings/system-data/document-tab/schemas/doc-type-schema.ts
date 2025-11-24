import { z } from "zod";

export const DocTypeClientSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(1, t("nameRequired")),
    key: z
      .string()
      .min(1, t("keyRequired"))
      .regex(
        /^[a-z0-9_]+$/,
        t("keyInvalidFormat")
      ),
  });

export type DocTypeFormInput = z.infer<
  ReturnType<typeof DocTypeClientSchema>
>;
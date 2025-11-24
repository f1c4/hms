import { z } from "zod";

export const PatientNotesFormSchema = (t :(key :string) => string) => z.object({
  note: z
    .string()
    .max(1000, { message: t("noteMaxLength") })
    .optional(),
});
export type PatientNotesFormType = z.infer<ReturnType<typeof PatientNotesFormSchema>>;
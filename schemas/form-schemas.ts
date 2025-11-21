import * as z from "zod";

export const loginFormSchema = z.object({
  email: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
});

export type loginFormType = z.infer<typeof loginFormSchema>;

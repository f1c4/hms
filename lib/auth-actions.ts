"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { loginFormSchema, LoginFormType } from "@/components/login-form";

export const signInAction = async (
  formData: LoginFormType,
) => {
  // Fetch translations for error messages
  const t = await getTranslations("Auth.LoginForm");

  const validatedData = loginFormSchema.safeParse(formData as LoginFormType);
  if (!validatedData.success) {
    return { success: false, error: t("loginError") };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: validatedData.data.email,
    password: validatedData.data.password,
  });
  if (error) {
    return { success: false, error: error.message };
  }

  const locale = await getLocale();

  // Default fallback
  return redirect({ href: "/dashboard", locale });
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const locale = await getLocale();
  return redirect({ href: "/", locale });
};

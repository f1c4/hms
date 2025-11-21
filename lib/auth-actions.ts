"use server";

import { createClient } from "@/utils/supabase/server";
import { loginFormSchema, loginFormType } from "@/schemas/form-schemas";
import { redirect } from "@/i18n/navigation";
import { redirect as redirectNext } from "next/navigation";
import { getLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";

export const signInAction = async (
  formData: loginFormType,
  returnUrl: string
) => {
  // Use email as a rate limiting identifier
  const identifier = formData.email.toLowerCase();
  if (!identifier) {
    return { success: false, error: "Email is required" };
  }

  // Fetch translations for error messages
  const t = await getTranslations("Auth.LoginForm");

  const rawData = {
    email: formData.email,
    password: formData.password,
  };

  const validatedData = loginFormSchema.safeParse(rawData);
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

  // If returnUrl is provided and valid, redirect to it
  if (returnUrl) {
    try {
      // Basic validation to prevent open redirect vulnerabilities
      if (returnUrl.startsWith("/") && !returnUrl.includes("//")) {
        // Check if the URL already contains a locale prefix
        const supportedLocales = ["en", "sr-Latn", "ru"];
        const urlParts = returnUrl.split("/").filter(Boolean);

        if (urlParts.length > 0 && supportedLocales.includes(urlParts[0])) {
          // URL already has locale, use it directly
          return redirectNext(returnUrl);
        } else {
          // URL doesn't have locale, add it
          return redirect({ href: returnUrl, locale });
        }
      }
    } catch (e) {
      console.error("Invalid return URL:", e);
      // Fallback to default if there's any issue
    }
  }

  // Default fallback
  return redirect({ href: "/dashboard/patients", locale });
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const locale = await getLocale();
  return redirect({ href: "/", locale });
};

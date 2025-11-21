import LoginForm from "@/components/login-form";
import { LocaleSwitcher } from "@/components/locale-switcher";
import ThemeToggle from "@/components/theme-toggle";
import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Auth.LoginPage");

  return (
    <main className="flex min-h-svh flex-col items-center justify-between bg-muted p-6 md:p-10">
      <header className="flex justify-between items-center w-full max-w-sm md:max-w-5xl">
        <ThemeToggle />
        <span />
        <LocaleSwitcher />
      </header>
      <div className="flex flex-col items-center gap-10 w-full max-w-sm md:max-w-3xl">
        <h1 className="text-3xl md:text-5xl font-semibold text-center">
          PZU &quot;Medical Vraneš&quot;
        </h1>
        <LoginForm />
      </div>
      <footer className="flex items-center justify-center h-6 w-full max-w-sm md:max-w-5xl">
        <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
          {t("footer")} {t("terms")}
        </div>
      </footer>
    </main>
  );
}

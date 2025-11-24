"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";

interface CommandAction {
  id: string;
  label: string;
  shortcut?: string[];
  keywords?: string[];
  section?: string;
  perform: () => void;
  icon?: React.ReactNode;
}

export function useThemeActions(): CommandAction[] {
  const { theme, setTheme } = useTheme();
  const t = useTranslations("Components.ThemeSwitcher");

  return React.useMemo(
    () => [
      {
        id: "toggleTheme",
        label: t("toggleTheme"),
        shortcut: ["t", "t"],
        keywords: ["toggle", "theme", "dark", "light"],
        section: t("theme"),
        perform: () => {
          setTheme(theme === "light" ? "dark" : "light");
        },
      },
      {
        id: "setLightTheme",
        label: t("setLightTheme"),
        keywords: ["light", "theme"],
        section: t("theme"),
        perform: () => setTheme("light"),
      },
      {
        id: "setDarkTheme",
        label: t("setDarkTheme"),
        keywords: ["dark", "theme"],
        section: t("theme"),
        perform: () => setTheme("dark"),
      },
    ],
    [theme, setTheme, t]
  );
}

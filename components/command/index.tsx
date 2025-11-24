"use client";

import * as React from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useSidebarData } from "@/hooks/use-sidebar-data";
import { CommandDialog } from "./command-dialog";
import { useThemeActions } from "./use-theme-actions";

interface CommandAction {
  id: string;
  label: string;
  shortcut?: string[];
  keywords?: string[];
  section?: string;
  perform: () => void;
  icon?: React.ReactNode;
}

export function CommandMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const { navMenuData } = useSidebarData();
  const navItems = navMenuData.navMain;
  const t = useTranslations("Components.Kbar");
  const themeActions = useThemeActions();

  const navigateTo = React.useCallback(
    (url: string) => {
      router.push(url);
      setOpen(false);
    },
    [router]
  );

  // Build navigation actions
  const navigationActions = React.useMemo<CommandAction[]>(
    () =>
      navItems.flatMap((navItem) => {
        const baseAction =
          navItem.url !== "#"
            ? {
                id: `${navItem.title.toLowerCase()}Action`,
                label: navItem.title,
                shortcut: navItem.shortcut,
                keywords: [navItem.title.toLowerCase()],
                section: t("navigation"),
                perform: () => navigateTo(navItem.url),
              }
            : null;

        const childActions =
          navItem.items?.map((childItem) => ({
            id: `${childItem.title.toLowerCase()}Action`,
            label: childItem.title,
            shortcut: childItem.shortcut,
            keywords: [childItem.title.toLowerCase()],
            section: navItem.title,
            perform: () => navigateTo(childItem.url),
          })) ?? [];

        return baseAction ? [baseAction, ...childActions] : childActions;
      }),
    [navItems, navigateTo, t]
  );

  // Combine all actions
  const actions = React.useMemo(
    () => [...navigationActions, ...themeActions],
    [navigationActions, themeActions]
  );

  // Handle keyboard shortcut (Ctrl+K or Cmd+K)
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen} actions={actions} />
      {children}
    </>
  );
}

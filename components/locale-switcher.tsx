"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { Globe } from "lucide-react";
import { useLocale } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";

export function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const activeLocale = useLocale();

  function stripLocale(path: string) {
    const parts = path.split("/");
    if (routing.locales.includes(parts[1])) {
      const rest = parts.slice(2).join("/");
      return "/" + rest;
    }
    return path;
  }

  function onSelectChange(nextLocale: string) {
    if (nextLocale === activeLocale) return;
    const normalizedPath = stripLocale(pathname);
    router.replace(
      {
        pathname: normalizedPath === "/" ? "/" : normalizedPath,
      },
      { locale: nextLocale }
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Globe className="h-6 w-6 text-muted-foreground" />
          <span>{activeLocale.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup
          value={activeLocale}
          onValueChange={onSelectChange}
        >
          {routing.locales.map((locale) => (
            <DropdownMenuRadioItem key={locale} value={locale}>
              {locale === "sr-Latn" ? "SR" : locale.toUpperCase()}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

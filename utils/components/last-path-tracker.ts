"use client";

import { usePathname } from "@/i18n/navigation";
import { useEffect } from "react";
import { setCookie } from "cookies-next";
import { localeNames } from "@/i18n/locale-config";

// Paths we don't want to save
const EXCLUDED_PATHS = [
  "/unauthorized",
  "/404",
  "/500",
  "/login",
  "/register",
  "/patients/new",
];

export function LastPathTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Don't save excluded paths
    if (!EXCLUDED_PATHS.some((excluded) => pathname.includes(excluded))) {
      // Remove locale prefix from path
      const parts = pathname.split("/");
      if (parts.length >= 2) {
        // Check if first part is a locale
        const isLocalePrefix = localeNames.includes(parts[1]);

        // Remove the locale part (e.g., "/en/dashboard" -> "/dashboard")
        const cleanPath = isLocalePrefix
          ? `/${parts.slice(2).join("/")}`
          : pathname;

        if (cleanPath && cleanPath !== "/") {
          setCookie("LAST_PATH", cleanPath, {
            maxAge: 60 * 60 * 24 * 30, // 30 days in seconds
            path: "/",
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
          });
        }
      }
    }
  }, [pathname]);

  return null; // This component doesn't render anything
}

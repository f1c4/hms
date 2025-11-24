"use client";

import { useCallback } from "react";
import { format, parseISO, isValid } from "date-fns";
import { useLocale } from "next-intl";
import { supportedLocales } from "@/i18n/locale-config"; // 1. Import the config object
import { enUS } from "date-fns/locale"; // Keep enUS as a fallback

/**
 * A reusable hook that provides a memoized, i18n-aware date formatting function.
 */
export function useFormatDate() {
  const currentLocale = useLocale();

  const formatDate = useCallback(
    (dateInput: string | undefined | Date, formatToken: string): string => {
      const locale = supportedLocales[currentLocale] || enUS;
      if (!dateInput) return "—"; // Use a clear "empty" indicator

      let date: Date;

      // Determine the input type and parse accordingly
      if (typeof dateInput === 'string') {
        // Use the robust parser from date-fns for ISO strings
        date = parseISO(dateInput);
      } else {
        // It's already a Date object
        date = dateInput;
      }
      
      // Final check to ensure we have a valid date before formatting
      if (!isValid(date)) {
        console.error("Date formatting failed: Invalid date provided", dateInput);
        return "Invalid Date";
      }

      try {
        return format(date, formatToken, { locale });
      } catch (error) {
        console.error("Date formatting failed:", error);
        return "Invalid Date";
      }
    },
    [currentLocale]
  );

  return formatDate;
}
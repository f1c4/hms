import { type Locale as DateFnsLocale } from "date-fns";
import { enUS, ru } from "date-fns/locale";
import { srLatn } from "date-fns/locale/sr-Latn"; // Note the specific import path for sr-Latn

/**
 * The single source of truth for supported locales.
 * Maps the URL locale string to the corresponding date-fns locale object.
 */
export const supportedLocales: Record<string, DateFnsLocale> = {
  "en": enUS,
  "sr-Latn": srLatn,
  "ru": ru,
  // When you add a new language, add it here.
  // e.g., "de": de, (after importing `de` from 'date-fns/locale')
};

/**
 * An array of locale strings derived from the configuration object.
 * This will be used by next-intl's routing.
 */
export const localeNames = Object.keys(supportedLocales);

/**
 * Returns an array of locales to translate to, excluding the source locale.
 * @param sourceLocale The locale of the original text.
 * @returns An array of target locale strings.
 */
export function getTargetLocales(sourceLocale: string): string[] {
  return localeNames.filter((l) => l !== sourceLocale);
}

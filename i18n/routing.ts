import { defineRouting } from "next-intl/routing";
import { localeNames } from "./locale-config";

export const routing = defineRouting({
    // 2. Use the imported array as the single source of truth
    locales: localeNames,

    // Used when no locale matches
    defaultLocale: "en",
    // localeCookie: true, // This is not a valid property for defineRouting
});

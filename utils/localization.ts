import { LocalizedName } from "@/features/patients/table/types";

/**
 * Extracts localized string from JSONB name field.
 * Falls back: locale → 'en' → first available → null
 */
export function getLocalizedName(
    name: LocalizedName,
    locale: string,
): string | null {
    if (!name || typeof name !== "object") return null;

    return (
        name[locale] ??
            name["en"] ??
            Object.values(name)[0] ??
            null
    );
}

/**
 * Formats full address from patient data with localized city name.
 * Returns: "Address, PostalCode CityName, CountryName"
 */
export function formatPatientAddress(
    patient: {
        residenceAddress: string | null;
        residenceCityName: LocalizedName;
        residenceCityPostalCode: string | null;
        residenceCountryIso2: string | null;
    },
    locale: string,
    translateCountry: (iso2: string) => string,
): string | null {
    const parts: string[] = [];

    // Street address
    if (patient.residenceAddress) {
        parts.push(patient.residenceAddress);
    }

    // City with postal code
    const cityName = getLocalizedName(patient.residenceCityName, locale);
    if (patient.residenceCityPostalCode || cityName) {
        const cityPart = [patient.residenceCityPostalCode, cityName]
            .filter(Boolean)
            .join(" ");
        if (cityPart) parts.push(cityPart);
    }

    // Country (translated via next-intl)
    if (patient.residenceCountryIso2) {
        parts.push(translateCountry(patient.residenceCountryIso2));
    }

    return parts.length > 0 ? parts.join(", ") : null;
}

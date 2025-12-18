import { useMemo } from "react";
import { usePersonalFields } from "./use-form-fields";
import { PatientPersonalFormType } from "../schemas/schemas";
import { useMainStore } from "@/store/main-store";
import { createNewPatientData } from "@/features/patients/store/create-new-patient-data";
import { PersonalFieldDefinition } from "../types";
import { useLocale, useTranslations } from "next-intl";
import { PatientPersonalModel } from "@/types/data-models";

/**
 * Maps form field names (camelCase) to data property names (snake_case).
 * Only needed for DB fields, not derived fields.
 */
const FIELD_TO_DATA_KEY: Record<string, keyof PatientPersonalModel> = {
  parentName: "parent_name",
  birthCountryId: "birth_country_id",
  birthCityId: "birth_city_id",
  maritalStatus: "marital_status",
  professionId: "profession_id",
  educationLevel: "education_level",
  employmentStatus: "employment_status",
  employerId: "employer_id",
  livingArrangement: "living_arrangement",
};

/**
 * Helper to get localized name from JSONB translations object.
 * Preserves locale keys like "sr-Latn" without transformation.
 */
function getLocalizedName(
  translations: Record<string, string> | null | undefined,
  locale: string,
): string | null {
  if (!translations) return null;
  return (
    translations[locale] ??
      translations["en"] ??
      Object.values(translations)[0] ??
      null
  );
}

export function useFields() {
  const formFields = usePersonalFields();
  const pristineData = useMainStore((state) => state.patient.pristineData);
  const tCountries = useTranslations("Countries");
  const locale = useLocale();

  const infoFields = useMemo((): Omit<PersonalFieldDefinition, "error">[] => {
    // Get personal data directly without snake_to_camel transformation
    const personalData: PatientPersonalModel | null = pristineData?.personal ??
      createNewPatientData().personal;

    const mappedFields = formFields.map((field) => {
      const fieldName = field.name as keyof PatientPersonalFormType;
      const dataKey = FIELD_TO_DATA_KEY[fieldName];

      // Get the raw value from data using the mapped key
      let displayValue: string | number | null = dataKey
        ? (personalData?.[dataKey] as string | number | null) ?? null
        : null;

      // For select fields with static options, map value to label
      if (field.type === "select" && field.options && displayValue !== null) {
        const selectedOption = field.options.find(
          (opt) => opt.value === displayValue,
        );
        if (selectedOption) {
          displayValue = selectedOption.label;
        }
      }

      return {
        ...field,
        value: displayValue,
      };
    });

    // Birth Country - Use derived field directly
    const countryFieldIndex = mappedFields.findIndex(
      (field) => field.name === "birthCountryId",
    );
    if (countryFieldIndex !== -1 && personalData?.birthCountryIso2) {
      const isoCode = personalData.birthCountryIso2;
      mappedFields[countryFieldIndex].value = tCountries(isoCode) || isoCode;
    }

    // Birth City - Use derived field directly, access name_translations without transformation
    const cityFieldIndex = mappedFields.findIndex(
      (field) => field.name === "birthCityId",
    );
    if (cityFieldIndex !== -1 && personalData?.birthCity) {
      const city = personalData.birthCity;
      // city.name is already Record<string, string> - no transformation needed
      const cityName = getLocalizedName(city.name, locale) ?? "Unknown";
      mappedFields[cityFieldIndex].value = `${city.postal_code} - ${cityName}`;
    }

    // Profession - Use derived field directly, access name_translations without transformation
    const professionFieldIndex = mappedFields.findIndex(
      (field) => field.name === "professionId",
    );
    if (professionFieldIndex !== -1 && personalData?.profession) {
      const profession = personalData.profession;
      // profession.name_translations is already Record<string, string> - no transformation needed
      const professionName = getLocalizedName(
        profession.name_translations,
        locale,
      );
      mappedFields[professionFieldIndex].value = professionName;
    }
    // Employer - Use derived field directly (plain text name, no translations)
    const employerFieldIndex = mappedFields.findIndex(
      (field) => field.name === "employerId",
    );
    if (employerFieldIndex !== -1 && personalData?.employer) {
      mappedFields[employerFieldIndex].value = personalData.employer.name;
    }

    return mappedFields;
  }, [formFields, pristineData, tCountries, locale]);

  return { formFields, infoFields };
}

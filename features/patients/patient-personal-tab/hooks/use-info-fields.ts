import { useMemo } from "react";
import { usePersonalFields } from "./use-form-fields";
import { PatientPersonalFormType } from "../schemas/schemas";
import { useMainStore } from "@/store/main-store";
import { deepSnakeToCamel } from "@/utils/utils";
import { createNewPatientData } from "@/features/patients/store/create-new-patient-data";
import { PersonalFieldDefinition } from "../types";
import { useLocale, useTranslations } from "next-intl";

export function useFields() {
  const formFields = usePersonalFields();
  const pristineData = useMainStore((state) => state.patient.pristineData);
  const tCountries = useTranslations("Countries");
  const locale = useLocale();

  const infoFields = useMemo((): Omit<PersonalFieldDefinition, "error">[] => {
    const personalData = pristineData?.personal ??
      createNewPatientData().personal;

    const defaultValues = deepSnakeToCamel(personalData) as Partial<
      PatientPersonalFormType & {
        birthCountryIso2: string | null;
        birthCity: {
          id: number;
          name: Record<string, string> | string;
          postalCode: string;
        } | null;
      }
    >;

    const mappedFields = formFields.map((field) => {
      let displayValue =
        defaultValues[field.name as keyof PatientPersonalFormType] ?? null;

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

    const countryFieldIndex = mappedFields.findIndex(
      (field) => field.name === "birthCountryId",
    );
    if (countryFieldIndex !== -1 && defaultValues.birthCountryIso2) {
      const isoCode = defaultValues.birthCountryIso2;
      mappedFields[countryFieldIndex].value = tCountries(isoCode) || isoCode;
    }

    // Birth City - Handle JSONB name field
    const cityFieldIndex = mappedFields.findIndex(
      (field) => field.name === "birthCityId",
    );
    if (cityFieldIndex !== -1 && defaultValues.birthCity) {
      const city = defaultValues.birthCity;
      const cityName = typeof city.name === "string"
        ? city.name
        : city.name?.[locale] ??
          city.name?.["en"] ??
          Object.values(city.name ?? {})[0] ??
          "Unknown";

      mappedFields[cityFieldIndex].value = `${city.postalCode} - ${cityName}`;
    }

    return mappedFields;
  }, [formFields, pristineData, tCountries, locale]);

  return { formFields, infoFields };
}

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { cloneDeep } from "lodash";

// Store and hooks
import { useMainStore } from "@/store/main-store";
import { useFormFields } from "./use-form-fields";
import { useFormatDate } from "@/hooks/use-format-date";

// Utils and types
import { snakeToCamel } from "@/utils/utils";
import { PatientGeneralFormInput } from "../schemas/info-form-schema";
import { GeneralFieldDefinition } from "../types";

export function useFields() {
  const formFields = useFormFields();
  const pristineData = useMainStore((state) => state.patient.pristineData);
  const tCountries = useTranslations("Countries");
  const formatDate = useFormatDate();

  const infoFields = useMemo((): Omit<GeneralFieldDefinition, "error">[] => {
    if (!pristineData?.general) {
      return formFields.map((field) => ({ ...field, value: null }));
    }

    const data = cloneDeep(pristineData.general);

    const defaultValues = snakeToCamel(data) as Partial<
      PatientGeneralFormInput & {
        residenceCountryIso2: string | null;
        citizenshipCountryIso2: string | null;
        residenceCity: { id: number; name: string; postalCode: string } | null;
      }
    >;

    const mappedFields = formFields.map((field) => {
      let value = defaultValues[field.name as keyof PatientGeneralFormInput] ??
        null;

      // --- Handle Date Formatting ---
      if (field.type === "date") {
        // If the value is a Date object, format it; otherwise, it's null.
        value = value instanceof Date ? formatDate(value, "PP") : null;
      } // --- Handle Select Formatting ---
      else if (field.type === "select" && field.options && value !== null) {
        const selectedOption = field.options.find((opt) => opt.value === value);
        if (selectedOption) {
          value = selectedOption.label;
        }
      }

      return {
        ...field,
        value: value,
      };
    });

    // --- Special Handling for Display Values (remains the same) ---

    // Citizenship Country
    const citizenshipCountryIndex = mappedFields.findIndex(
      (field) => field.name === "citizenshipCountryId",
    );
    if (
      citizenshipCountryIndex !== -1 && defaultValues.citizenshipCountryIso2
    ) {
      const isoCode = defaultValues.citizenshipCountryIso2;
      mappedFields[citizenshipCountryIndex].value = tCountries(isoCode) ||
        isoCode;
    }

    // Residence Country
    const residenceCountryIndex = mappedFields.findIndex(
      (field) => field.name === "residenceCountryId",
    );
    if (residenceCountryIndex !== -1 && defaultValues.residenceCountryIso2) {
      const isoCode = defaultValues.residenceCountryIso2;
      mappedFields[residenceCountryIndex].value = tCountries(isoCode) ||
        isoCode;
    }

    // Residence City
    const residenceCityIndex = mappedFields.findIndex(
      (field) => field.name === "residenceCityId",
    );
    if (residenceCityIndex !== -1 && defaultValues.residenceCity) {
      const city = defaultValues.residenceCity;
      mappedFields[residenceCityIndex].value =
        `${city.postalCode} ${city.name}`;
    }

    return mappedFields;
  }, [formFields, pristineData, tCountries, formatDate]);

  return { formFields, infoFields };
}

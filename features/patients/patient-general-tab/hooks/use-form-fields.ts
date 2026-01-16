"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { GeneralFieldDefinition } from "../types";

/**
 * A custom hook that returns a memoized array of general information field definitions.
 * This encapsulates the field configuration and types.
 * @returns An array of field definitions for the general info form and list.
 */
export function useFormFields(): Omit<
  GeneralFieldDefinition,
  "value" | "error"
>[] {
  const tFields = useTranslations("Patient.GeneralForm");
  const tOptions = useTranslations("Patient.GeneralOptions");

  const fields = useMemo(
    (): Omit<GeneralFieldDefinition, "value" | "error">[] => {
      const emergencyContactOptions = [
        { value: "PARENT", label: tOptions("relationParent") },
        { value: "SIBLING", label: tOptions("relationSibling") },
        { value: "SPOUSE", label: tOptions("relationSpouse") },
        { value: "CHILD", label: tOptions("relationChild") },
        { value: "FRIEND", label: tOptions("relationFriend") },
        { value: "OTHER", label: tOptions("relationOther") },
      ];

      return [
        // --- Group 1: Primary Identification ---
        {
          name: "firstName",
          type: "text",
          label: `${tFields("firstName")} *`,
          placeholder: tFields("firstNamePlaceholder"),
          group: "primary",
        },
        {
          name: "lastName",
          type: "text",
          label: `${tFields("lastName")} *`,
          placeholder: tFields("lastNamePlaceholder"),
          group: "primary",
        },
        {
          name: "dateOfBirth",
          type: "date",
          label: `${tFields("birthDate")} *`,
          placeholder: tFields("birthDatePlaceholder"),
          group: "primary",
        },
        // --- Group 2: Citizenship & National ID ---
        {
          name: "citizenshipCountryId",
          label: tFields("citizenshipCountry"),
          placeholder: tFields("citizenshipCountryPlaceholder"),
          type: "select",
          group: "citizenship",
        },
        {
          name: "nationalIdNumber",
          type: "numeric-string",
          label: tFields("nationalIdNumber"),
          placeholder: tFields("nationalIdNumberPlaceholder"),
          group: "citizenship",
        },
        // --- Group 3: Residence & Contact ---
        {
          name: "residenceCountryId",
          type: "select",
          label: tFields("residenceCountry"),
          placeholder: tFields("residenceCountryPlaceholder"),
          group: "residence",
        },
        {
          name: "residenceCityId",
          type: "select",
          label: tFields("residenceCity"),
          placeholder: tFields("residenceCityPlaceholder"),
          group: "residence",
        },
        {
          name: "residenceAddress",
          type: "text",
          label: tFields("residenceAddress"),
          placeholder: tFields("residenceAddressPlaceholder"),
          group: "residence",
        },
        {
          name: "phone",
          type: "tel",
          label: tFields("phone"),
          placeholder: tFields("phonePlaceholder"),
          group: "residence",
        },
        {
          name: "email",
          type: "email",
          label: tFields("email"),
          placeholder: tFields("emailPlaceholder"),
          group: "residence",
        },
        // --- Group 4: Emergency Contact ---
        {
          name: "emergencyContactName",
          type: "text",
          label: tFields("emergencyContactName"),
          placeholder: tFields("emergencyContactNamePlaceholder"),
          group: "emergency",
        },
        {
          name: "emergencyContactPhone",
          type: "text",
          label: tFields("emergencyContactPhone"),
          placeholder: tFields("emergencyContactPhonePlaceholder"),
          group: "emergency",
        },
        {
          name: "emergencyContactRelation",
          type: "select",
          label: tFields("emergencyContactRelation"),
          placeholder: tFields("emergencyContactRelationPlaceholder"),
          group: "emergency",
          options: emergencyContactOptions,
        },
      ];
    },
    [tFields, tOptions],
  );

  return fields;
}

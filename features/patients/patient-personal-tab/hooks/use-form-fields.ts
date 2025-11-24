"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { PersonalFieldDefinition } from "../types";

/**
 * A custom hook that returns a memoized array of personal information field definitions.
 * This encapsulates the field configuration, types, and select options.
 * @returns An array of field definitions for the personal info form and list.
 */
export function usePersonalFields(): Omit<PersonalFieldDefinition, "value" | "error">[] {
  const tFields = useTranslations("Patient.PersonalForm");
  const tOptions = useTranslations("Patient.PersonalOptions");

  const fields = useMemo((): Omit<PersonalFieldDefinition, "value" | "error">[] => {
    // Define static options here
    const maritalStatusOptions = [
      { value: "SINGLE", label: tOptions("maritalStatusSingle") },
      { value: "MARRIED", label: tOptions("maritalStatusMarried") },
      { value: "DIVORCED", label: tOptions("maritalStatusDivorced") },
      { value: "WIDOWED", label: tOptions("maritalStatusWidowed") },
      { value: "OTHER", label: tOptions("maritalStatusOther") },
    ];

    const educationLevelOptions = [
      { value: "NONE", label: tOptions("educationLevelNone") },
      { value: "PRIMARY", label: tOptions("educationLevelPrimary") },
      { value: "SECONDARY", label: tOptions("educationLevelSecondary") },
      { value: "TERTIARY", label: tOptions("educationLevelTertiary") },
      { value: "POSTGRADUATE", label: tOptions("educationLevelPostgraduate") },
    ];

    const employmentStatusOptions = [
      { value: "EMPLOYED", label: tOptions("employmentStatusEmployed") },
      { value: "SELF_EMPLOYED", label: tOptions("employmentStatusSelfEmployed") },
      { value: "UNEMPLOYED", label: tOptions("employmentStatusUnemployed") },
      { value: "STUDENT", label: tOptions("employmentStatusStudent") },
      { value: "RETIRED", label: tOptions("employmentStatusRetired") },
      { value: "OTHER", label: tOptions("employmentStatusOther") },
    ];

    const livingArrangementOptions = [
      { value: "LIVING_ALONE", label: tOptions("livingArrangementLivingAlone") },
      { value: "LIVING_WITH_PARTNER", label: tOptions("livingArrangementLivingWithPartner") },
      { value: "LIVING_WITH_FAMILY", label: tOptions("livingArrangementLivingWithFamily") },
      { value: "STATIONARY_CARE", label: tOptions("livingArrangementStationaryCare") },
      { value: "OTHER", label: tOptions("livingArrangementOther") },
    ];

    return [
      // --- Group 1: Origin ---
      {
        name: "parentName",
        type: "text",
        label: tFields("parentName"),
        placeholder: tFields("parentNamePlaceholder"),
        group: "origin",
      },
      {
        name: "birthCountryId",
        type: "select", 
        label: tFields("birthCountry"),
        placeholder: tFields("birthCountryPlaceholder"),
        group: "origin",
      },
      {
        name: "birthCityId",
        type: "select", 
        label: tFields("birthCity"),
        placeholder: tFields("birthCityPlaceholder"),
        group: "origin",
      },

      // --- Group 2: Social Status ---
      {
        name: "maritalStatus",
        type: "select", 
        label: tFields("maritalStatus"),
        placeholder: tFields("maritalStatusPlaceholder"),
        options: maritalStatusOptions, 
        group: "social",
      },
      {
        name: "livingArrangement",
        type: "select",
        label: tFields("livingArrangement"),
        placeholder: tFields("livingArrangementPlaceholder"),
        options: livingArrangementOptions,
        group: "social",
      },

      // --- Group 3: Professional Life ---
      {
        name: "educationLevel",
        type: "select",
        label: tFields("educationLevel"),
        placeholder: tFields("educationLevelPlaceholder"),
        options: educationLevelOptions, 
        group: "professional",
      },
      {
        name: "profession",
        type: "text",
        label: tFields("profession"),
        placeholder: tFields("professionPlaceholder"),
        group: "professional",
      },
      {
        name: "employmentStatus",
        type: "select",
        label: tFields("employmentStatus"),
        placeholder: tFields("employmentStatusPlaceholder"),
        options: employmentStatusOptions,
        group: "professional",
      },
      {
        name: "employerName",
        type: "text",
        label: tFields("employerName"),
        placeholder: tFields("employerNamePlaceholder"),
        group: "professional",
      },
    ];
  }, [tFields, tOptions]);

  return fields;
}
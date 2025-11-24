"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { RiskFieldDefinition } from "../types";

/**
 * A custom hook that returns a memoized array of risk information field definitions.
 * This encapsulates the field configuration, types, and select options.
 * @returns An array of field definitions for the risk info form and list.
 */
export function useRiskFields(): Omit<RiskFieldDefinition, "value" | "error">[] {
    const tFields = useTranslations("Patient.RisksForm");
    const tOptions = useTranslations("Patient.RisksOptions");

    const fields = useMemo((): Omit<RiskFieldDefinition, "value" | "error">[] => {
        // Define all select options in one place
        const genderOptions = [
            { value: "MALE", label: tOptions("genderOptionMale") },
            { value: "FEMALE", label: tOptions("genderOptionFemale") },
            { value: "OTHER", label: tOptions("genderOptionOther") },
        ];
        const bloodTypeOptions = [
            { value: "A+", label: "A+" },
            { value: "A-", label: "A-" },
            { value: "B+", label: "B+" },
            { value: "B-", label: "B-" },
            { value: "AB+", label: "AB+" },
            { value: "AB-", label: "AB-" },
            { value: "O+", label: "O+" },
            { value: "O-", label: "O-" },
        ];
        const smokingOptions = [
            { value: "NON_SMOKER", label: tOptions("smokingOptionsNonSmoker") },
            { value: "FORMER_SMOKER", label: tOptions("smokingOptionsFormerSmoker") },
            { value: "OCCASIONAL_SMOKER", label: tOptions("smokingOptionsOccasionalSmoker") },
            { value: "CURRENT_SMOKER", label: tOptions("smokingOptionsCurrentSmoker") },
        ];
        const alcoholOptions = [
            { value: "NON_DRINKER", label: tOptions("alcoholOptionsNonDrinker") },
            { value: "SOCIAL_DRINKER", label: tOptions("alcoholOptionsSocialDrinker") },
            { value: "REGULAR_DRINKER", label: tOptions("alcoholOptionsRegularDrinker") },
            { value: "HEAVY_DRINKER", label: tOptions("alcoholOptionsHeavyDrinker") },
        ];
        const activityOptions = [
            { value: "SEDENTARY", label: tOptions("activityOptionsSedentary") },
            { value: "LIGHT", label: tOptions("activityOptionsLight") },
            { value: "MODERATE", label: tOptions("activityOptionsModerate") },
            { value: "ACTIVE", label: tOptions("activityOptionsActive") },
        ];
        const stressOptions = [
            { value: "LOW", label: tOptions("stressOptionsLow") },
            { value: "MODERATE", label: tOptions("stressOptionsModerate") },
            { value: "HIGH", label: tOptions("stressOptionsHigh") },
        ];

        return [
            // --- Group 1: Biometrics ---
            {
                name: "gender",
                type: "select",
                label: tFields("genderLabel"),
                placeholder: tFields("genderPlaceholder"),
                options: genderOptions,
                group: "biometrics",
            },
            {
                name: "bloodType",
                type: "select",
                label: tFields("bloodTypeLabel"),
                placeholder: tFields("bloodTypePlaceholder"),
                options: bloodTypeOptions,
                group: "biometrics",
            },

            // --- Group 2: Measurements ---
            {
                name: "weight",
                type: "number",
                label: `${tFields("weightLabel")} (kg)`,
                placeholder: tFields("weightPlaceholder"),
                group: "measurements",
            },
            {
                name: "height",
                type: "number",
                label: `${tFields("heightLabel")} (cm)`,
                placeholder: tFields("heightPlaceholder"),
                group: "measurements",
            },
            {
                name: "waistCircumference",
                type: "number",
                label: `${tFields("waistCircumferenceLabel")} (cm)`,
                placeholder: tFields("waistCircumferencePlaceholder"),
                group: "measurements",
            },
            // --- Group 2: Lifestyle Factors ---
            {
                name: "smokingStatus",
                type: "select",
                label: tFields("smokingStatusLabel"),
                placeholder: tFields("smokingStatusPlaceholder"),
                options: smokingOptions,
                group: "lifestyle",
            },
            {
                name: "alcoholConsumption",
                type: "select",
                label: tFields("alcoholConsumptionLabel"),
                placeholder: tFields("alcoholConsumptionPlaceholder"),
                options: alcoholOptions,
                group: "lifestyle",
            },
            {
                name: "physicalActivityLevel",
                type: "select",
                label: tFields("physicalActivityLevelLabel"),
                placeholder: tFields("physicalActivityLevelPlaceholder"),
                options: activityOptions,
                group: "lifestyle",
            },
            {
                name: "stressLevel",
                type: "select",
                label: tFields("stressLevelLabel"),
                placeholder: tFields("stressLevelPlaceholder"),
                options: stressOptions,
                group: "lifestyle",
            },
        ];
    }, [tFields, tOptions]);

    return fields;
}
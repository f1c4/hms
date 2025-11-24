import { useMemo } from "react";
import { useRiskFields } from "./use-form-fields";
import { PatientRiskFormInput } from "../schemas/schemas";
import { useMainStore } from "@/store/main-store";
import { snakeToCamel } from "@/utils/utils";
import { createNewPatientData } from "@/features/patients/store/create-new-patient-data";
import { DisplayFieldDefinition, RiskFieldDefinition } from "../types";
import { useTranslations } from "next-intl";

export function useFields() {
  const formFields = useRiskFields();
  const pristineData = useMainStore((state) => state.patient.pristineData);
  const tFields = useTranslations("Patient.RisksForm");

  const infoFields = useMemo(
    (): (RiskFieldDefinition | DisplayFieldDefinition)[] => {
      const riskData = pristineData?.risk ?? createNewPatientData().risk;
      const defaultValues = snakeToCamel(riskData) as Partial<
        PatientRiskFormInput
      >;

      const mappedFields: RiskFieldDefinition[] = formFields.map((field) => {
        const value = defaultValues[field.name] ?? null;
        let displayValue = value;

        if (field.type === "select" && field.options && value) {
          const selectedOption = field.options.find((opt) =>
            opt.value === value
          );
          displayValue = selectedOption ? selectedOption.label : value;
        }

        return {
          ...field,
          value: displayValue,
        };
      });

      if (riskData) {
        const calculatedFields: DisplayFieldDefinition[] = [
          {
            name: "age",
            label: tFields("ageLabel"),
            value: riskData.age,
            group: "biometrics",
          },
          {
            name: "bmi",
            label: tFields("bmiLabel"),
            value: riskData.bmi,
            group: "measurements",
          },
          {
            name: "obesityStatus",
            label: tFields("obesityStatusLabel"),
            value: riskData.obesity_status
              ? tFields(
                `obesityStatus${riskData.obesity_status.charAt(0)}${
                  riskData.obesity_status.slice(1).toLowerCase()
                }`,
              )
              : null,
            group: "measurements",
          },
        ];

        return [...mappedFields, ...calculatedFields];
      }

      return mappedFields;
    },
    [formFields, pristineData, tFields],
  );

  return { formFields, infoFields };
}

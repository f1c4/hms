import { PatientRiskFormInput } from "./schemas/schemas";

/**
 * Defines the structure for each field in the patient risk form and list.
 */
export interface RiskFieldDefinition {
  name: keyof PatientRiskFormInput; // Ensures name matches keys in PatientRiskFormInput
  label: string;
  value: string | number | null | undefined;
  error?: string;
  placeholder?: string;
  type?: "text" | "number" | "select"; // Input type for rendering
  options?: { label: string; value: string }[]; // For select fields
  group: "measurements" | "lifestyle" | "biometrics"; // For grouping fields in the list
}

/**
 * Defines the structure for display-only fields in the patient risk list.
 */
export interface DisplayFieldDefinition {
  name: string; // Allows any string, like "age" or "bmi"
  label: string;
  value: string | number | null | undefined;
  group: "measurements" | "lifestyle" | "biometrics"; // For grouping fields in the list
}

import { PatientPersonalFormType } from "./schemas/schemas";

/**
 * Defines the structure for each field in the patient personal form and list.
 */
export interface PersonalFieldDefinition {
  name: keyof PatientPersonalFormType;
  label: string;
  value: string | number | null;
  error?: string;
  placeholder?: string;
  type?: "text" | "select"; // Input type for form rendering
  options?: { label: string; value: string | null }[]; // For select fields
  group?: "origin" | "social" | "professional"; // For grouping fields in the list
}

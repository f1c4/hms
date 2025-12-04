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
  type?: "text" | "select";
  options?: { label: string; value: string | null }[];
  group?: "origin" | "social" | "professional";
}

/**
 * Defines the structure for a City object with JSONB name field.
 */
export interface City {
  id: number;
  name: Record<string, string>;
  postal_code: string;
}

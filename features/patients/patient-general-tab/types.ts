import { PatientGeneralFormInput } from "./schemas/info-form-schema";

/**
 * Defines the structure for each field in the patient general form and list.
 */
export interface GeneralFieldDefinition {
  name: keyof PatientGeneralFormInput;
  label: string;
  value: string | number | Date | null;
  error?: string;
  placeholder?: string;
  type?: "text" | "email" | "tel" | "date" | "select" | "numeric-string";
  options?: { value: string; label: string }[];
  group: "primary" | "citizenship" | "residence" | "emergency";
}

/**
 * Defines the structure for a City object.
 */
export interface City {
  id: number;
  name: Record<string, string>;
  postal_code: string;
}

import { PatientNotesFormType } from "./schemas/schemas";
import { Database } from "@/types/database";

/**
 * Defines the structure for each field in the patient medical form and list.
 */
export interface NotesFieldDefinition {
  name: keyof PatientNotesFormType; // e.g., 'notes'
  label: string;
  value: string | number | null; // The current value from workingData
  error?: string; // The current error from medicalTabErrors
  placeholder?: string;
  type?: "text" | "textarea"; // Input type
}

export type PatientNotesTypeDb = Database["public"]["Tables"]["patient_notes"];

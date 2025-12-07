import { Database as GeneratedDatabase } from "./database";
import {
  FullPatientDataModel,
  FullSystemDataModel,
  MedicalHistoryEventModel,
} from "./data-models";
import { PatientListBasicResponse } from "@/features/patients/table/types";

// 1. Define the custom functions you want to override.
type CustomFunctions = {
  get_full_patient_data: {
    Args: {
      p_patient_id: number;
    };
    Returns: FullPatientDataModel;
  };
  get_full_system_data: {
    Args: Record<string, never>;
    Returns: FullSystemDataModel;
  };
  get_patient_medical_history: {
    Args: {
      p_patient_id: number;
    };
    Returns: MedicalHistoryEventModel[];
  };
  create_event_with_diagnoses: {
    Args: {
      p_patient_id: number;
      p_user_id: string;
      p_event_date: string;
      p_title: Record<string, string>;
      p_notes?: Record<string, string> | null;
      p_diagnosis_codes: string[];
    };
    Returns: number;
  };
  update_event_with_diagnoses: {
    Args: {
      p_event_id: number;
      p_user_id: string;
      p_event_date: string;
      p_title: Record<string, string>;
      p_notes?: Record<string, string> | null;
      p_diagnosis_codes: string[];
    };
    Returns: void;
  };
  get_patient_list_basic: {
    Args: {
      p_limit?: number;
      p_offset?: number;
      p_first_name?: string | null;
      p_last_name?: string | null;
      p_national_id?: string | null;
      p_phone?: string | null;
      p_sort?: string;
      p_order?: string;
    };
    Returns: PatientListBasicResponse;
  };
  // You can add other custom functions here in the future
};

// 2. Create a new Database type that merges the generated types with your custom functions.
export type Database = Omit<GeneratedDatabase, "public"> & {
  public: Omit<GeneratedDatabase["public"], "Functions"> & {
    Functions: CustomFunctions;
  };
};

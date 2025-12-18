import { Database } from "./database-custom";
import { City } from "@/features/patients/patient-general-tab/types";

// ===========================================================================
// GENERIC DATABASE TYPES
// ===========================================================================
export type CompanyInfoTypeDb = Database["public"]["Tables"]["company_info"];
export type PatientNotesTypeDb = Database["public"]["Tables"]["patient_notes"];
export type DocumentsTypeDb = Database["public"]["Tables"]["document_types"];
export type CompaniesTypeDb = Database["public"]["Tables"]["companies"];

// ===========================================================================
// SYSTEM / ADMIN DATA MODELS (for settings pages)
// ===========================================================================

export type EmployerModel = {
  id: number;
  name: string;
};

export type ProfessionModel = {
  id: number;
  name_translations: Record<string, string> | null;
};

export type MedicalDocumentTypeModel =
  & Omit<
    Database["public"]["Tables"]["medical_document_types"]["Row"],
    "name_translations"
  >
  & {
    name_translations: Record<string, string> | null;
  };

// Represents a plan within the admin/system data view
export type InsurancePlanAdminModel = {
  id: number;
  name_translations: Record<string, string> | null;
  description_translations: Record<string, string> | null;
};

// Represents a provider with its nested plans for the admin/system data view
export type InsuranceProviderAdminModel =
  & Omit<
    Database["public"]["Tables"]["insurance_providers"]["Row"],
    "contact_info" | "name_translations"
  >
  & {
    contact_info: Record<string, string> | null;
    name_translations: Record<string, string> | null;
    plans: InsurancePlanAdminModel[];
  };

// Represents the entire JSON object returned by the get_full_system_data function
export type FullSystemDataModel = {
  insurance_data: InsuranceProviderAdminModel[];
  medical_document_types: MedicalDocumentTypeModel[];
};

// ===========================================================================
// MEDICAL HISTORY DATA MODELS
// ===========================================================================

export type MedicalHistoryDiagnosisModel = {
  diagnosis_code: string;
  diagnosis_translations: Record<string, string> | null;
};

export type MedicalHistoryDocumentModel =
  & Omit<
    Database["public"]["Tables"]["patient_medical_documents"]["Row"],
    "title" | "notes"
  >
  & {
    notes: Record<string, string> | null;
    document_type_translations: Record<string, string> | null;
    diagnoses: MedicalHistoryDiagnosisModel[];
  };

export type MedicalHistoryEventModel =
  & Omit<
    Database["public"]["Tables"]["patient_medical_history_events"]["Row"],
    "title" | "notes"
  >
  & {
    title: Record<string, string> | null;
    notes: Record<string, string> | null;
    documents: MedicalHistoryDocumentModel[];
    diagnoses: MedicalHistoryDiagnosisModel[];
  };

// ===========================================================================
// PATIENT DATA MODELS (for patient-specific views)
// ===========================================================================

export type PatientGeneralModel =
  & Database["public"]["Tables"]["patient_general"]["Row"]
  & {
    residenceCity: City | null;
    residenceCountryIso2: string | null;
    citizenshipCountryIso2: string | null;
  };

export type PatientIdDocumentModel =
  & Database["public"]["Tables"]["patient_id_documents"]["Row"]
  & {
    documentTypeTranslations: Record<string, string> | null;
  };

export type InsuranceProviderModel =
  & Omit<
    Database["public"]["Tables"]["insurance_providers"]["Row"],
    "contact_info" | "name_translations"
  >
  & {
    contact_info: Record<string, string> | null;
    name_translations: Record<string, string> | null;
  };

export type InsurancePlanModel =
  & Omit<
    Database["public"]["Tables"]["insurance_plans"]["Row"],
    "coverage_details" | "name_translations" | "description_translations"
  >
  & {
    provider: InsuranceProviderModel;
    coverage_details: Record<string, string> | null;
    name_translations: Record<string, string> | null;
    description_translations: Record<string, string> | null;
  };

export type PatientInsuranceModel =
  & Database["public"]["Tables"]["patient_insurances"]["Row"]
  & {
    plan: InsurancePlanModel;
  };

export type PatientPersonalModel =
  & Omit<
    Database["public"]["Tables"]["patient_personal"]["Row"],
    "profession"
  >
  & {
    birthCity: City | null;
    birthCountryIso2: string | null;
    profession: ProfessionModel | null; // Add profession object
    employer: EmployerModel | null;
  };

export type PatientRisksModel =
  Database["public"]["Views"]["patient_risk_view"]["Row"];

export type PatientNotesModel =
  & Omit<Database["public"]["Tables"]["patient_notes"]["Row"], "note">
  & {
    note: Record<string, string> | null;
  };

export type FullPatientDataModel = {
  general: PatientGeneralModel;
  id_documents: PatientIdDocumentModel[] | null;
  insurances: PatientInsuranceModel[] | null;
  personal: PatientPersonalModel | null;
  risk: PatientRisksModel | null;
  notes: PatientNotesModel[] | null;
};

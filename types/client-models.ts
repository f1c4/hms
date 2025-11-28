import {
  FullPatientDataModel,
  MedicalHistoryDiagnosisModel,
  MedicalHistoryDocumentModel,
  MedicalHistoryEventModel,
  PatientGeneralModel,
  PatientIdDocumentModel,
  PatientInsuranceModel,
} from "./data-models";

// ===========================================================================
// GENERIC CLIENT-SIDE TYPES
// ===========================================================================

export const DOCUMENT_TYPE_ENTITIES = [
  "identity_document",
  "medical_record",
] as const;

export type DocumentTypeEntity = (typeof DOCUMENT_TYPE_ENTITIES)[number];

// ===========================================================================
// PATIENT CLIENT MODELS (Client-centric shapes with Date objects)
// ===========================================================================

export type PatientGeneralClientModel =
  & Omit<PatientGeneralModel, "date_of_birth">
  & {
    date_of_birth: Date | null;
  };

export type PatientIdDocumentClientModel =
  & Omit<
    PatientIdDocumentModel,
    "issue_date" | "expiry_date" | "documentTypeTranslations"
  >
  & {
    documentTypeTranslations: Record<string, string> | null;
    issue_date: Date | null;
    expiry_date: Date | null;
  };

export type PatientInsuranceClientModel =
  & Omit<PatientInsuranceModel, "effective_date" | "expiry_date">
  & {
    effective_date: Date;
    expiry_date: Date | null;
  };

export type FullPatientClientModel =
  & Omit<FullPatientDataModel, "general" | "id_documents" | "insurances">
  & {
    general: PatientGeneralClientModel;
    id_documents: PatientIdDocumentClientModel[] | null;
    insurances: PatientInsuranceClientModel[] | null;
  };

// ===========================================================================
// MEDICAL HISTORY CLIENT MODELS
// ===========================================================================

export type MedicalHistoryDiagnosisClientModel = MedicalHistoryDiagnosisModel;

export type MedicalHistoryDocumentClientModel =
  & Omit<
    MedicalHistoryDocumentModel,
    "document_date" | "diagnoses"
  >
  & {
    document_date: Date;
    diagnoses: MedicalHistoryDiagnosisClientModel[];
  };

export type MedicalHistoryEventClientModel =
  & Omit<
    MedicalHistoryEventModel,
    "event_date" | "documents" | "diagnoses" | "ai_translation_status"
  >
  & {
    event_date: Date;
    ai_translation_status?: "idle" | "in_progress" | "completed" | "failed";
    documents: MedicalHistoryDocumentClientModel[];
    diagnoses: MedicalHistoryDiagnosisClientModel[];
  };

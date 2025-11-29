import {
  FullPatientDataModel,
  MedicalHistoryDiagnosisModel,
  MedicalHistoryDocumentModel,
  MedicalHistoryEventModel,
  PatientGeneralModel,
  PatientIdDocumentModel,
  PatientInsuranceModel,
  PatientNotesModel,
} from "./data-models";

import { AiTranslationStatus } from "@/features/patients/patient-medical-history-tab/types";

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

export type PatientNotesClientModel =
  & Omit<PatientNotesModel, "created_at" | "updated_at">
  & {
    created_at: Date;
    updated_at: Date | null;
  };

export type FullPatientClientModel =
  & Omit<
    FullPatientDataModel,
    "general" | "id_documents" | "insurances" | "notes"
  >
  & {
    general: PatientGeneralClientModel;
    id_documents: PatientIdDocumentClientModel[] | null;
    insurances: PatientInsuranceClientModel[] | null;
    notes: PatientNotesClientModel[] | null;
  };

// ===========================================================================
// MEDICAL HISTORY CLIENT MODELS
// ===========================================================================

export type MedicalHistoryDiagnosisClientModel = MedicalHistoryDiagnosisModel;

export type MedicalHistoryDocumentClientModel =
  & Omit<
    MedicalHistoryDocumentModel,
    "document_date" | "diagnoses" | "ai_translation_status"
  >
  & {
    document_date: Date;
    ai_translation_status?: AiTranslationStatus;
    diagnoses: MedicalHistoryDiagnosisClientModel[];
  };

export type MedicalHistoryEventClientModel =
  & Omit<
    MedicalHistoryEventModel,
    "event_date" | "documents" | "diagnoses" | "ai_translation_status"
  >
  & {
    event_date: Date;
    ai_translation_status?: AiTranslationStatus;
    documents: MedicalHistoryDocumentClientModel[];
    diagnoses: MedicalHistoryDiagnosisClientModel[];
  };

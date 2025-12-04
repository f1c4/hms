import {
  MedicalHistoryEventClientModel,
  PatientGeneralClientModel,
  PatientIdDocumentClientModel,
  PatientInsuranceClientModel,
} from "@/types/client-models";
import {
  MedicalHistoryEventModel,
  PatientGeneralModel,
  PatientIdDocumentModel,
  PatientInsuranceModel,
} from "@/types/data-models";
import { AiTranslationStatus } from "../patient-medical-history-tab/types";

/**
 * Converts date strings in patient data to Date objects for client-side use.
 * This function handles both the full patient data object and the isolated general data object.
 */
export const transformGeneralDataForClient = (
  data: PatientGeneralModel,
): PatientGeneralClientModel => {
  const { date_of_birth, ...rest } = data;
  const newDoc: Partial<PatientGeneralClientModel> = { ...rest };

  if (date_of_birth && typeof date_of_birth === "string") {
    const date = new Date(date_of_birth);
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    newDoc.date_of_birth = new Date(date.getTime() + timezoneOffset);
  } else {
    newDoc.date_of_birth = null;
  }

  return newDoc as PatientGeneralClientModel;
};

/**
 * Converts date strings in a single ID Document object to Date objects.
 * It transforms the DB-centric type to a client-centric type.
 */
export const transformIdDocumentForClient = (
  doc: PatientIdDocumentModel,
): PatientIdDocumentClientModel => {
  // 1. Destructure the properties that need conversion from the rest of the object.
  const { issue_date, expiry_date, ...rest } = doc;

  // 2. Create the new object with the compatible properties.
  const newDoc: Partial<PatientIdDocumentClientModel> = { ...rest };

  // 3. Convert and assign the issue_date.
  if (issue_date && typeof issue_date === "string") {
    const date = new Date(issue_date);
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    newDoc.issue_date = new Date(date.getTime() + timezoneOffset);
  } else {
    newDoc.issue_date = null;
  }

  // 4. Convert and assign the expiry_date.
  if (expiry_date && typeof expiry_date === "string") {
    const date = new Date(expiry_date);
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    newDoc.expiry_date = new Date(date.getTime() + timezoneOffset);
  } else {
    newDoc.expiry_date = null;
  }

  // 5. Return the fully constructed and correctly typed object.
  return newDoc as PatientIdDocumentClientModel;
};

/**
 * Converts date strings in a single Patient Insurance object to Date objects.
 */
export const transformInsuranceForClient = (
  ins: PatientInsuranceModel,
): PatientInsuranceClientModel => {
  const { effective_date, expiry_date, ...rest } = ins;
  const newIns: Partial<PatientInsuranceClientModel> = { ...rest };

  // effective_date is NOT NULL
  const effDate = new Date(effective_date);
  const effTimezoneOffset = effDate.getTimezoneOffset() * 60000;
  newIns.effective_date = new Date(effDate.getTime() + effTimezoneOffset);

  // expiry_date is nullable
  if (expiry_date && typeof expiry_date === "string") {
    const expDate = new Date(expiry_date);
    const expTimezoneOffset = expDate.getTimezoneOffset() * 60000;
    newIns.expiry_date = new Date(expDate.getTime() + expTimezoneOffset);
  } else {
    newIns.expiry_date = null;
  }

  return newIns as PatientInsuranceClientModel;
};

/**
 * Converts date strings in Medical History data to Date objects for client-side use.
 * This function recursively transforms dates in events and their nested documents.
 */
export const transformMedicalHistoryForClient = (
  events: MedicalHistoryEventModel[],
): MedicalHistoryEventClientModel[] => {
  return events.map((event) => {
    const { event_date, documents, ai_translation_status, ...restOfEvent } =
      event;

    // Convert event_date
    const eventDate = new Date(event_date);
    const eventTimezoneOffset = eventDate.getTimezoneOffset() * 60000;
    const clientEventDate = new Date(eventDate.getTime() + eventTimezoneOffset);

    // Map ai_translation_status from string to AiTranslationStatus | undefined
    const clientAiTranslationStatus = ai_translation_status !== undefined
      ? (ai_translation_status as AiTranslationStatus)
      : undefined;

    // Transform documents within the event
    const clientDocuments = documents.map((doc) => {
      const { document_date, ...restOfDoc } = doc;
      const docDate = new Date(document_date);
      const docTimezoneOffset = docDate.getTimezoneOffset() * 60000;
      const clientDocDate = new Date(docDate.getTime() + docTimezoneOffset);
      return {
        ...restOfDoc,
        document_date: clientDocDate,
      };
    });

    return {
      ...restOfEvent,
      event_date: clientEventDate,
      ai_translation_status: clientAiTranslationStatus,
      documents: clientDocuments,
    } as MedicalHistoryEventClientModel;
  });
};

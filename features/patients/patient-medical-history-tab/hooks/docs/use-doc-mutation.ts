"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import { useMainStore } from "@/store/main-store";
import { useShallow } from "zustand/react/shallow";

import {
  ActionError,
  createPatientMedicalDocument,
  deletePatientMedicalDocument,
  updatePatientMedicalDocument,
} from "../../actions/docs-actions";
import { MedicalDocumentFormInput } from "../../schemas/docs-form-schema";
import { MedicalHistoryDocumentClientModel } from "@/types/client-models";
import {
  CreateMedicalDocumentInput,
  UpdateMedicalDocumentInput,
} from "../../schemas/docs-srv-schemas";

import { useTusUpload } from "../use-tus-upload";

// Type guard to check for a successful result
function isSuccessful(
  result: unknown,
): result is {
  data: MedicalHistoryDocumentClientModel | { documentId: number };
} {
  return (
    typeof result === "object" &&
    result !== null &&
    "data" in result &&
    !("error" in result && result.error)
  );
}

// Type guard to check for a predictable error
function hasActionError(result: unknown): result is { error: ActionError } {
  return (
    typeof result === "object" &&
    result !== null &&
    "error" in result &&
    !!result.error
  );
}

/**
 * A consolidated hook to manage all mutations (create, update, delete) for Medical Documents.
 */
export function useDocumentMutations() {
  const t = useTranslations();
  const tDocHints = useTranslations(
    "Patient.MedicalHistory.Documents.Notifications",
  );
  const locale = useLocale();
  const { medicalHistoryActions, patientId } = useMainStore(
    useShallow((state) => ({
      medicalHistoryActions: state.patient.medicalHistoryActions,
      patientId: state.patient.patientId,
    })),
  );

  const { startUpload, isUploading, uploadProgress } = useTusUpload();

  // --- CREATE MUTATION ---
  const createDocument = useMutation({
    mutationFn: async ({
      formData,
      parentEventId,
    }: {
      formData: MedicalDocumentFormInput;
      parentEventId: number;
    }) => {
      if (!patientId) throw new Error("Patient ID not found.");

      const { file: fileList, ...restOfFormData } = formData;
      const fileToUpload = fileList?.[0];

      if (!fileToUpload) {
        throw new Error("File is required to create a document.");
      }

      // 1. Upload the file and get its details
      const fileDetails = await startUpload(
        fileToUpload,
        patientId,
        parentEventId,
      );

      // 2. Prepare the input for the server action
      const input: CreateMedicalDocumentInput = {
        patientId: patientId,
        eventId: parentEventId,
        documentType: restOfFormData.documentType,
        documentDate: restOfFormData.documentDate,
        notes: restOfFormData.notes,
        diagnoses: restOfFormData.diagnoses?.map((d) => d.value) ?? [],
        ai_source_locale: locale,
        file: fileDetails,
      };

      // 3. Call the server action
      return createPatientMedicalDocument(input);
    },
    onSuccess: (result) => {
      if (isSuccessful(result)) {
        const newDoc = result.data as MedicalHistoryDocumentClientModel;
        medicalHistoryActions.addDocument(newDoc);
        toast.success(
          t("Patient.MedicalHistory.Documents.Notifications.createSuccess"),
        );

        if (newDoc.ai_translation_status === "in_progress") {
          setTimeout(() => {
            toast.message(
              tDocHints("translationStarted"),
            );
          }, 1000);
        } else if (newDoc.ai_translation_status === "failed") {
          setTimeout(() => {
            toast.warning(
              tDocHints("translationFailedShort"),
            );
          }, 1000);
        }
      } else if (hasActionError(result)) {
        toast.error(t(result.error.messageKey));
      }
    },
    onError: (error) => {
      toast.error(
        t("Patient.MedicalHistory.Documents.Validation.genericServerError"),
      );
      console.error("Create Document Error:", error);
    },
  });

  // --- UPDATE MUTATION ---
  const updateDocument = useMutation({
    mutationFn: async ({
      formData,
      documentId,
      parentEventId,
    }: {
      formData: MedicalDocumentFormInput;
      documentId: number;
      parentEventId: number;
    }) => {
      if (!patientId) throw new Error("Patient ID not found.");

      const { file: fileList, wantsToRemoveFile, ...rest } = formData;
      const newFileToUpload = fileList?.[0];
      let fileDetails: UpdateMedicalDocumentInput["file"] = undefined;

      // If a new file is provided, upload it.
      if (newFileToUpload) {
        fileDetails = await startUpload(
          newFileToUpload,
          patientId,
          parentEventId,
        );
      }

      const input: UpdateMedicalDocumentInput = {
        id: documentId,
        version: rest.version || 0,
        documentType: rest.documentType,
        documentDate: rest.documentDate,
        notes: rest.notes,
        diagnoses: rest.diagnoses?.map((d) => d.value) ?? [],
        ai_source_locale: locale,
        wantsToRemoveFile: wantsToRemoveFile ?? false,
        file: fileDetails,
      };

      return updatePatientMedicalDocument(input);
    },
    onSuccess: (result) => {
      if (isSuccessful(result)) {
        const updatedDoc = result.data as MedicalHistoryDocumentClientModel;
        medicalHistoryActions.updateDocument(updatedDoc);
        toast.success(
          t("Patient.MedicalHistory.Documents.Notifications.updateSuccess"),
        );

        if (updatedDoc.ai_translation_status === "in_progress") {
          setTimeout(() => {
            toast.message(tDocHints("translationStarted"));
          }, 1000);
        } else if (updatedDoc.ai_translation_status === "failed") {
          setTimeout(() => {
            toast.warning(
              tDocHints("translationFailedShort"),
            );
          }, 1000);
        }
      } else if (hasActionError(result)) {
        toast.error("Error updating document");
      }
    },
    onError: (error) => {
      toast.error(
        t("Patient.MedicalHistory.Documents.Validation.genericServerError"),
      );
      console.error("Update Document Error:", error);
    },
  });

  // --- DELETE MUTATION ---
  const deleteDocument = useMutation({
    mutationFn: async (documentId: number) => {
      return deletePatientMedicalDocument(documentId);
    },
    onSuccess: (result) => {
      if (isSuccessful(result)) {
        const { documentId } = result.data as { documentId: number };
        medicalHistoryActions.removeDocument(documentId);
        toast.success(
          t("Patient.MedicalHistory.Documents.Notifications.deleteSuccess"),
        );
      } else if (hasActionError(result)) {
        toast.error(t(result.error.messageKey));
      }
    },
    onError: (error) => {
      toast.error(
        t("Patient.MedicalHistory.Documents.Validation.genericServerError"),
      );
      console.error("Delete Document Error:", error);
    },
  });

  return {
    createDocument,
    updateDocument,
    deleteDocument,
    isProcessing: isUploading || createDocument.isPending ||
      updateDocument.isPending,
    progress: uploadProgress,
    processingLabel: isUploading
      ? t("Common.Progress.uploading")
      : t("Common.Progress.saving"),
  };
}

"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useMainStore } from "@/store/main-store";
import { useShallow } from "zustand/react/shallow";
import { createPatientIdDocument, deletePatientDocument, updatePatientIdDocument, validateDuplicateDocument } from "../../actions/actions-docs";
import { IdDocumentFormInput } from "../../schemas/id-doc-form-schema";
import { PatientIdDocumentClientModel } from "@/types/client-models";
import { useTusUpload } from "./use-tus-upload";
import { PatientIdDocumentModel } from "@/types/data-models";
import { useImageCompressor } from "../../../shared/hooks/use-image-compressor";

function isSuccessful(
  result: unknown
): result is { data: PatientIdDocumentModel | { documentId: number } } {
  if (typeof result !== "object" || result === null) {
    return false;
  }
  return "data" in result && !("error" in result && result.error);
}

// A type guard to check for a predictable error from our server actions.
function hasActionError(result: unknown): result is { error: { messageKey: string } } {
  if (typeof result !== "object" || result === null) {
    return false;
  }
  return "error" in result && !!result.error;
}


/**
 * A consolidated hook to manage all mutations (create, update, delete) for Patient ID Documents.
 * This includes orchestrating client-side image compression and the TUS resumable file upload process.
 */
export function useIdDocumentMutations() {
  const t = useTranslations();
  const { docActions, patientId } = useMainStore(
    useShallow((state) => ({
      docActions: state.patient.docActions,
      patientId: state.patient.patientId,
    }))
  );

  const { compressFile, isCompressing, compressionProgress } = useImageCompressor();
  const { startUpload, isUploading, uploadProgress } = useTusUpload();

  // --- CREATE MUTATION ---
  const createDocument = useMutation({
    mutationFn: async (formData: IdDocumentFormInput) => {
      if (!patientId) throw new Error("Patient ID not found.");

      const { file: fileList, ...restOfFormData } = formData;
      const originalFile = fileList?.[0];

      const validationResult = await validateDuplicateDocument(
        patientId,
        restOfFormData.documentType,
        restOfFormData.documentNumber,
        null
      );
      if (validationResult.error) return validationResult;

      let fileDetails = {};
      if (originalFile) {
        const fileToUpload = await compressFile(originalFile);
        fileDetails = await startUpload(fileToUpload, patientId);
      }

      const input = {
        ...restOfFormData,
        // Ensure required date fields are present (backend expects Date)
        issueDate: restOfFormData.issueDate ?? new Date(),
        expiryDate: restOfFormData.expiryDate ?? new Date(),
        ...fileDetails,
        patientId,
      };
      return createPatientIdDocument(input);
    },
    onSuccess: (result) => {
      if (isSuccessful(result)) {
        docActions.commitCreation(result.data as PatientIdDocumentModel);
        toast.success(t("Patient.GeneralIdDocumentNotifications.createSuccess"));
      } else if (hasActionError(result)) {
        toast.error(t(result.error.messageKey));
      }
    },
    onError: (error) => {
      toast.error(t("Patient.GeneralIdDocumentNotifications.genericServerError"));
      console.error("Create Document Error:", error);
    },
  });

  // --- UPDATE MUTATION ---
  const updateDocument = useMutation({
    mutationFn: async ({
      formData,
      existingDoc,
    }: {
      formData: IdDocumentFormInput;
      existingDoc: PatientIdDocumentClientModel;
    }) => {
      if (!patientId) throw new Error("Patient ID not found.");

      const { file: fileList, ...restOfFormData } = formData;
      const originalFile = fileList?.[0];

      const validationResult = await validateDuplicateDocument(
        patientId,
        restOfFormData.documentType,
        restOfFormData.documentNumber,
        existingDoc.id
      );
      if (validationResult.error) return validationResult;

      let fileDetails = {};
      if (originalFile) {
        const fileToUpload = await compressFile(originalFile);
        fileDetails = await startUpload(fileToUpload, patientId);
      }

      const input = {
        ...restOfFormData,
        ...fileDetails,
        issueDate: restOfFormData.issueDate ?? new Date(),
        expiryDate: restOfFormData.expiryDate ?? new Date(),
        id: existingDoc.id,
        version: existingDoc.version,
      };
      return updatePatientIdDocument(input);
    },
    onSuccess: (result) => {
      if (isSuccessful(result)) {
        docActions.commitUpdate(result.data as PatientIdDocumentModel);
        toast.success(t("Patient.GeneralIdDocumentNotifications.updateSuccess"));
      } else if (hasActionError(result)) {
        toast.error(t(result.error.messageKey));
      }
    },
    onError: (error) => {
      toast.error(t("Patient.GeneralIdDocumentNotifications.genericServerError"));
      console.error("Update Document Error:", error);
    },
  });

  // --- DELETE MUTATION ---
  const deleteDocument = useMutation({
    mutationFn: (documentId: number) => deletePatientDocument(documentId),
    onSuccess: (result) => {
      if (isSuccessful(result)) {
        docActions.commitDeletion(result.data.documentId);
        toast.success(t("Patient.GeneralIdDocumentNotifications.deleteSuccess"));
      } else if (hasActionError(result)) {
        toast.error(t(result.error.messageKey));
      }
    },
    onError: (error) => {
      toast.error(t("Patient.GeneralIdDocumentNotifications.genericServerError"));
      console.error("Delete Document Error:", error);
    },
  });

  return {
    createDocument,
    updateDocument,
    deleteDocument,
     isProcessing: isCompressing || isUploading,
    progress: isCompressing ? compressionProgress : uploadProgress,
    processingLabel: isCompressing ? t("Common.Progress.compressing") : t("Common.Progress.uploading"),
  };
}
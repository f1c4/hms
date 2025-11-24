"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useMainStore } from "@/store/main-store";
import { useShallow } from "zustand/react/shallow";

import {
  createPatientInsurance,
  updatePatientInsurance,
  deletePatientInsurance,
} from "../../actions/actions-insurance";
import { InsuranceFormInput } from "../../schemas/insurance-form-schema";
import { PatientInsuranceClientModel } from "@/types/client-models";
import { PatientInsuranceModel } from "@/types/data-models";
import { ActionError } from "../../actions/actions-insurance";

import { useTusUpload } from "./use-tus-upload";
import { useImageCompressor } from "../../../shared/hooks/use-image-compressor";
import { CreateInsuranceInput, UpdateInsuranceInput } from "../../schemas/insurance-doc-schema";

// Type guard to check for a successful result from our server actions.
function isSuccessful(
  result: unknown
): result is { data: PatientInsuranceModel | { insuranceId: number } } {
  return typeof result === "object" && result !== null && "data" in result && !("error" in result && result.error);
}

// Type guard to check for a predictable error from our server actions.
function hasActionError(result: unknown): result is { error: ActionError } {
  return typeof result === "object" && result !== null && "error" in result && !!result.error;
}

/**
 * A consolidated hook to manage all mutations (create, update, delete) for Patient Insurances.
 * This includes orchestrating client-side image compression and the TUS resumable file upload process.
 */
export function useInsuranceMutations() {
  const t = useTranslations();
  const { insuranceActions, patientId } = useMainStore(
    useShallow((state) => ({
      insuranceActions: state.patient.insuranceActions,
      patientId: state.patient.patientId,
    }))
  );

  const { compressFile, isCompressing, compressionProgress } = useImageCompressor();
  const { startUpload, isUploading, uploadProgress } = useTusUpload();

  // --- CREATE MUTATION ---
  const createInsurance = useMutation({
    mutationFn: async (formData: InsuranceFormInput) => {
      if (!patientId) throw new Error("Patient ID not found.");

      const { file: fileList, ...restOfFormData } = formData;
      const originalFile = fileList?.[0];

      let fileDetails = {};
      if (originalFile) {
        const fileToUpload = await compressFile(originalFile);
        fileDetails = await startUpload(fileToUpload, patientId);
      }

      const input: CreateInsuranceInput = {
        patient_id: patientId,
        plan_id: restOfFormData.planId,
        policy_number: restOfFormData.policyNumber,
        lbo_number: restOfFormData.lboNumber,
        effective_date: restOfFormData.effectiveDate!,
        expiry_date: restOfFormData.expiryDate,
        is_active: true,
        ...fileDetails,
      };
      return createPatientInsurance(input);
    },
    onSuccess: (result) => {
      if (isSuccessful(result)) {
        insuranceActions.commitCreation(result.data);
        toast.success(t("Patient.GeneralInsuranceNotifications.createSuccess"));
      } else if (hasActionError(result)) {
        toast.error(t(result.error.messageKey));
      }
    },
    onError: (error) => {
      toast.error(t("Patient.GeneralInsuranceNotifications.genericServerError"));
      console.error("Create Insurance Error:", error);
    },
  });

  // --- UPDATE MUTATION ---
  const updateInsurance = useMutation({
    mutationFn: async ({
      formData,
      existingIns,
    }: {
      formData: InsuranceFormInput;
      existingIns: PatientInsuranceClientModel;
    }) => {
      if (!patientId) throw new Error("Patient ID not found.");

      const { file: fileList, ...restOfFormData } = formData;
      const originalFile = fileList?.[0];

      let fileDetails = {};
      if (originalFile) {
        const fileToUpload = await compressFile(originalFile);
        fileDetails = await startUpload(fileToUpload, patientId);
      }

      const input: UpdateInsuranceInput = {
        id: existingIns.id,
        version: existingIns.version,
        plan_id: restOfFormData.planId,
        policy_number: restOfFormData.policyNumber,
        lbo_number: restOfFormData.lboNumber,
        effective_date: restOfFormData.effectiveDate!,
        expiry_date: restOfFormData.expiryDate,
        is_active: existingIns.is_active,
        wantsToRemoveFile: restOfFormData.wantsToRemoveFile,
        ...fileDetails,
      };
      return updatePatientInsurance(input);
    },
    onSuccess: (result) => {
      if (isSuccessful(result)) {
        insuranceActions.commitUpdate(result.data);
        toast.success(t("Patient.GeneralInsuranceNotifications.updateSuccess"));
      } else if (hasActionError(result)) {
        toast.error(t(result.error.messageKey));
      }
    },
    onError: (error) => {
      toast.error(t("Patient.GeneralInsuranceNotifications.genericServerError"));
      console.error("Update Insurance Error:", error);
    },
  });

  // --- DELETE MUTATION ---
  const deleteInsurance = useMutation({
    mutationFn: (insuranceId: number) => deletePatientInsurance(insuranceId),
    onSuccess: (result) => {
      if (isSuccessful(result)) {
        insuranceActions.commitDeletion(result.data.insuranceId);
        toast.success(t("Patient.GeneralInsuranceNotifications.deleteSuccess"));
      } else if (hasActionError(result)) {
        toast.error(t(result.error.messageKey));
      }
    },
    onError: (error) => {
      toast.error(t("Patient.GeneralInsuranceNotifications.genericServerError"));
      console.error("Delete Insurance Error:", error);
    },
  });

  return {
    createInsurance,
    updateInsurance,
    deleteInsurance,
    isProcessing: isCompressing || isUploading,
    progress: isCompressing ? compressionProgress : uploadProgress,
    processingLabel: isCompressing ? t("Common.Progress.compressing") : t("Common.Progress.uploading"),
  };
}
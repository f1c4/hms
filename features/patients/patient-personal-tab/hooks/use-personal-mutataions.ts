"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useMainStore } from "@/store/main-store";
import {
  createPatientPersonal,
  updatePatientPersonal,
} from "../actions/actions";
import { PatientPersonalFormType } from "../schemas/schemas";
import { useShallow } from "zustand/react/shallow";
import { useTranslations } from "next-intl";

export function usePatientPersonalMutation() {
  const tNotification = useTranslations("Patient.PersonalNotifications");

  const {
    patientId,
    setPristineData,
    setSectionState,
    sectionState,
    pristineData,
  } = useMainStore(
    useShallow((state) => ({
      patientId: state.patient.patientId,
      pristineData: state.patient.pristineData,
      sectionState: state.patient.uiState.personal.info,
      setPristineData: state.patient.personalActions.commit,
      setSectionState: state.patient.actions.setSectionState,
    })),
  );

  const isCreating = sectionState.mode === "create";

  return useMutation({
    mutationFn: (data: PatientPersonalFormType) => {
      if (isCreating) {
        if (!patientId) throw new Error("Patient ID not found for creation.");
        return createPatientPersonal(data, patientId);
      } else {
        if (!patientId) throw new Error("Patient ID not found.");

        const currentVersion = pristineData?.personal?.version;
        if (typeof currentVersion !== "number") {
          throw new Error("Could not determine data version. Please refresh.");
        }
        return updatePatientPersonal(data, patientId, currentVersion);
      }
    },

    onSuccess: (updatedData) => {
      if (isCreating) {
        setSectionState("personal", "info", { mode: "view" });
        setPristineData(updatedData);

        toast.success(tNotification("addPersonalDataSuccess"));
        return;
      }

      setSectionState("personal", "info", { mode: "view" });
      setPristineData(updatedData);

      toast.success(tNotification("updatePersonalDataSuccess"));
    },

    onError: (error) => {
      const message = isCreating
        ? tNotification("addPersonalDataError")
        : tNotification("updatePersonalDataError");

      console.error(`${message}`, error.message);
      setSectionState("personal", "info", { isDirty: true });
      toast.error(`${message}: ${error.message}`);
    },
  });
}

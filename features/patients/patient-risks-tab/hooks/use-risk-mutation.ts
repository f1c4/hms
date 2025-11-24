"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useMainStore } from "@/store/main-store";
import { createPatientRisk, updatePatientRisk } from "../actions/actions";
import { PatientRiskFormOutput } from "../schemas/schemas";
import { useShallow } from "zustand/react/shallow";
import { useTranslations } from "next-intl";

export function usePatientRiskMutation() {
  const tNotification = useTranslations("Patient.RisksNotifications");
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
      sectionState: state.patient.uiState.risk.info,
      setPristineData: state.patient.riskActions.commit,
      setSectionState: state.patient.actions.setSectionState,
    })),
  );
  const isCreating = sectionState.mode === "create";

  return useMutation({
    mutationFn: (data: PatientRiskFormOutput) => {
      if (isCreating) {
        if (!patientId) throw new Error("Patient ID not found for creation.");
        return createPatientRisk(data, patientId);
      } else {
        if (!patientId) throw new Error("Patient ID not found.");

        const currentVersion = pristineData?.risk?.version;
        if (typeof currentVersion !== "number") {
          throw new Error("Could not determine data version. Please refresh.");
        }
        return updatePatientRisk(data, patientId, currentVersion);
      }
    },

    onSuccess: (updatedData) => {
      if (isCreating) {
        setSectionState("risk", "info", { mode: "view" });
        setPristineData(updatedData);
      } else {
        setSectionState("risk", "info", { isDirty: false });
        setSectionState("risk", "info", { mode: "view" });
        setPristineData(updatedData);
      }
      const message = isCreating
        ? tNotification("updatePatientRisksDataSuccess")
        : tNotification("addPatientRisksDataSuccess");
      toast.success(message);
    },

    onError: (error) => {
      const errorMessage = isCreating
        ? tNotification("updatePatientRisksDataError")
        : tNotification("addPatientRisksDataError");

      console.error(`${errorMessage}`, error.message);
      setSectionState("risk", "info", { isDirty: true });
      toast.error(`${errorMessage}: ${error.message}`);
    },
  });
}

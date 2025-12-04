"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useMainStore } from "@/store/main-store";
import {
  createPatientGeneral,
  updatePatientGeneral,
} from "../actions/actions-info";
import { PatientGeneralFormOutput } from "../schemas/info-form-schema";
import { useShallow } from "zustand/react/shallow";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

export function usePatientInfoMutation() {
  const t = useTranslations("Patient.GeneralNotifications");
  const router = useRouter();

  const {
    patientId,
    pristineData,
    sectionState,
    setPristineData,
    setSectionState,
  } = useMainStore(
    useShallow((state) => ({
      patientId: state.patient.patientId,
      pristineData: state.patient.pristineData,
      sectionState: state.patient.uiState.general.info,
      setPristineData: state.patient.infoActions.commit,
      setSectionState: state.patient.actions.setSectionState,
    })),
  );

  const isCreating = sectionState.mode === "create";

  return useMutation({
    mutationFn: (data: PatientGeneralFormOutput) => {
      if (isCreating) {
        return createPatientGeneral(data);
      } else {
        if (!patientId) throw new Error(t("patientIdNorFound"));

        const currentVersion = pristineData?.general?.version;
        if (typeof currentVersion !== "number") {
          throw new Error(t("dataVersionError"));
        }
        return updatePatientGeneral(data, patientId, currentVersion);
      }
    },

    onSuccess: (updatedData) => {
      if (isCreating) {
        // New: navigate to the canonical patient page so all tabs enable and mode = view
        toast.success(t("addedGeneralSuccess"));
        router.replace(`/dashboard/patients/${updatedData.id}`);
        return;
      }

      // Existing patient update: keep the current page and switch to view
      setPristineData(updatedData);
      setSectionState("general", "info", { mode: "view" });

      toast.success(t("updatedGeneralSuccess"));
    },

    onError: (error: Error) => {
      const message = isCreating
        ? t("addedGeneralError")
        : t("updatedGeneralError");

      console.error(`${message}:`, error);
      setSectionState("general", "info", { isDirty: true });
      toast.error(`${message}: ${error.message}`);
    },
  });
}

"use client";

import { useEffect } from "react";
import { useMainStore } from "@/store/main-store";
import { useShallow } from "zustand/react/shallow";
import { Spinner } from "@/components/spinner";
import Patient from "./patient";
import {
  FullPatientDataModel,
  MedicalHistoryEventModel,
} from "@/types/data-models";

export default function PatientClient({
  patientId,
  initialData,
  medicalHistoryData,
}: {
  patientId: number | null;
  initialData: FullPatientDataModel | null;
  medicalHistoryData: MedicalHistoryEventModel[] | null;
}) {
  const { isInitialized, actions, medicalHistoryActions } = useMainStore(
    useShallow((state) => ({
      isInitialized: state.patient.isInitialized,
      actions: state.patient.actions,
      medicalHistoryActions: state.patient.medicalHistoryActions,
    }))
  );

  useEffect(() => {
    const store = useMainStore.getState();
    const currentId = store.patient.patientId;

    // Skip only if same existing patient already initialized
    if (
      store.patient.isInitialized &&
      currentId !== null &&
      currentId === patientId
    ) {
      return;
    }

    if (patientId === null) {
      actions.createDefaultPatientData();
      medicalHistoryActions.initializeMedicalHistory([]);
    } else if (initialData) {
      actions.initialize(initialData);
      medicalHistoryActions.initializeMedicalHistory(medicalHistoryData ?? []);
    }

    return () => {
      actions.clearPatientState();
    };
  }, [
    patientId,
    initialData,
    medicalHistoryData,
    actions,
    medicalHistoryActions,
  ]);

  if (!isInitialized) {
    return <Spinner size="page" />;
  }

  return <Patient />;
}

"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { useMainStore } from "@/store/main-store";
import { useShallow } from "zustand/react/shallow";

export type PatientTabValue =
  | "general"
  | "documents"
  | "personal"
  | "risks"
  | "history"
  | "notes"
  | "medical"

export interface PatientTab {
  value: PatientTabValue;
  label: string;
  disabled: boolean;
  hasData: boolean;
}

export const usePatientTabs = () => {
  const t = useTranslations("Patient.Tabs");
  const { patientId, pristineData, medicalHistory } = useMainStore(
    useShallow((state) => ({
      patientId: state.patient.patientId,
      pristineData: state.patient.pristineData,
      medicalHistory: state.patient.medicalHistory,
    }))
  );

  return useMemo(() => {
    const isNewPatient = patientId === null;
    const medicalHistoryDataPresence =
      (medicalHistory?.data?.length ?? 0) > 0;
    const idDocumentsDataPresence =
      !!(pristineData?.id_documents && pristineData.id_documents.length > 0);
    const insurancesDataPresence =
      !!(pristineData?.insurances && pristineData.insurances.length > 0);

    const dataPresence = {
    general: !!pristineData?.general && pristineData.general.id > 0,
    documents: idDocumentsDataPresence || insurancesDataPresence,
    personal: !!pristineData?.personal && pristineData.personal.id > 0,
    risks: !!pristineData?.risk && typeof pristineData.risk.id === "number" && pristineData.risk.id > 0,
    medical: !!pristineData?.medical && pristineData.medical.id > 0,
    history: medicalHistoryDataPresence,
    notes: !!pristineData?.notes && pristineData.notes.length > 0,
    };

    const tabs: PatientTab[] = [
      {
        value: "general",
        label: t("generalTab"),
        disabled: false,
        hasData: dataPresence.general,
      },
      {
        value: "documents",
        label: t("documentsTab"),
        disabled: isNewPatient,
        hasData: dataPresence.documents,
      },
      {
        value: "personal",
        label: t("personalTab"),
        disabled: isNewPatient,
        hasData: dataPresence.personal,
      },
      {
        value: "risks",
        label: t("risksTab"),
        disabled: isNewPatient,
        hasData: dataPresence.risks,
      },
      {
        value: "history",
        label: t("historyTab"),
        disabled: isNewPatient,
        hasData: dataPresence.history,
      },
      {
        value: "notes",
        label: t("notesTab"),
        disabled: isNewPatient,
        hasData: dataPresence.notes,
      },
      {
        value: "medical",
        label: t("medicalDataTab"),
        disabled: isNewPatient,
        hasData: dataPresence.medical,
      },
    ];

    return tabs;
  }, [patientId, pristineData, t, medicalHistory]);
};
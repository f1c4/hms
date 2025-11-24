"use client";

import PageContainer from "@/components/layout/page-container";
import PatientTabs from "./patient-tabs";
import { Heading } from "@/components/heading";
import { useMainStore } from "@/store/main-store";
import { formatFullName } from "@/utils/utils";
import { useTranslations } from "next-intl";
import { useShallow } from "zustand/react/shallow";

export default function Patient() {
  const t = useTranslations("Patient");

  const { pristineData, activeTab, actions, patientId } = useMainStore(
    useShallow((state) => ({
      patientId: state.patient.patientId,
      pristineData: state.patient.pristineData,
      activeTab: state.patient.activeTab,
      actions: state.patient.actions,
    }))
  );

  const isNew = patientId === null;
  const contactInfo = `${pristineData?.general.email} / ${pristineData?.general.phone}`;

  const title = isNew
    ? t("newPatient")
    : formatFullName(
        pristineData?.general.first_name ?? "",
        pristineData?.general.last_name ?? ""
      );

  const description = isNew
    ? t("newPatientSubtitle")
    : contactInfo || t("viewPatientSubtitle");

  return (
    <PageContainer scrollable={true}>
      <Heading title={title} description={description} />
      <PatientTabs setActiveTab={actions.setActiveTab} activeTab={activeTab} />
    </PageContainer>
  );
}

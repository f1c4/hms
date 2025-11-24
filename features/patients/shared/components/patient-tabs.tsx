"use client";

import { Tabs } from "@/components/ui/tabs";
import { memo } from "react";

import PatientGeneralTab from "../../patient-general-tab";
import PatientDocumentsTab from "../../patient-documents-tab";
import PatientPersonalTab from "../../patient-personal-tab";
import PatientRiskTab from "../../patient-risks-tab";
import PatientMedicalDataTab from "../../patient-medical-data-tab";
import PatientNotesTab from "../../patient-notes-tab";
import PatientActionBar from "./patient-action-bar";
import PatientHistoryTab from "../../patient-medical-history-tab";
import { AnimatePresence, motion } from "framer-motion";

// Memoized components for performance
const MemoizedPatientGeneralTab = memo(PatientGeneralTab);
const MemoizedPatientDocumentsTab = memo(PatientDocumentsTab);
const MemoizedPatientPersonalTab = memo(PatientPersonalTab);
const MemoizedPatientRisksTab = memo(PatientRiskTab);
const MemoizedPatientMedicalDataTab = memo(PatientMedicalDataTab);
const MemoizedPatientNotesTab = memo(PatientNotesTab);
const MemoizedPatientHistoryTab = memo(PatientHistoryTab);

interface PatientTabsProps {
  setActiveTab: (tab: string) => void;
  activeTab: string;
}

export default function PatientTabs({
  setActiveTab,
  activeTab,
}: PatientTabsProps) {
  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return <MemoizedPatientGeneralTab />;
      case "documents":
        return <MemoizedPatientDocumentsTab />;
      case "personal":
        return <MemoizedPatientPersonalTab />;
      case "risks":
        return <MemoizedPatientRisksTab />;
      case "history":
        return <MemoizedPatientHistoryTab />;
      case "notes":
        return <MemoizedPatientNotesTab />;
      case "medical":
        return <MemoizedPatientMedicalDataTab />;
      default:
        return <MemoizedPatientGeneralTab />;
    }
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="flex-1 flex flex-col gap-0"
    >
      <PatientActionBar />
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.99 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="flex flex-col gap-4 pb-4 flex-1 overflow-auto"
        >
          {renderTabContent()}
        </motion.div>
      </AnimatePresence>
    </Tabs>
  );
}

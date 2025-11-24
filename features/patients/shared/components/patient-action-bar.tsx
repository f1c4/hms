"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import PatientActionButtons from "./patient-action-buttons";

import { usePatientTabs } from "../hooks/use-patient-tabs";
import { useMainStore } from "@/store/main-store";
import { useShallow } from "zustand/react/shallow";

export default function PatientActionBar() {
  const { activeTab, setActiveTab, patientId } = useMainStore(
    useShallow((state) => ({
      activeTab: state.patient.activeTab,
      setActiveTab: state.patient.actions.setActiveTab,
      patientId: state.patient.patientId,
    }))
  );
  const tabs = usePatientTabs();

  const handleTabChange = (newTabValue: string) => {
    setActiveTab(newTabValue);
  };

  return (
    <div className="flex w-full justify-between items-center gap-4 mb-4">
      {/* 1. Desktop Tabs (Visible on md screens and up) */}
      <TabsList
        defaultValue={activeTab}
        className="hidden lg:flex gap-1.5 px-1.5 py-1 shrink-0"
      >
        {tabs.map((tabItem) => (
          <TabsTrigger
            key={tabItem.value}
            value={tabItem.value}
            disabled={tabItem.disabled}
            onClick={() => {
              if (!tabItem.disabled) {
                handleTabChange(tabItem.value);
              }
            }}
            className="relative"
          >
            {tabItem.label}
            {tabItem.hasData && (
              <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-primary"></span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>

      {/* 2. Mobile Select (Visible below lg screens) */}
      <div className="w-full lg:hidden">
        <Select onValueChange={handleTabChange} value={activeTab}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {tabs.map((tabItem) => (
                <SelectItem
                  key={tabItem.value}
                  value={tabItem.value}
                  disabled={tabItem.disabled}
                  className="flex justify-between items-center"
                >
                  {tabItem.label}
                  {tabItem.hasData && (
                    <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-primary"></span>
                  )}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* 3. Action Buttons */}
      <PatientActionButtons patientId={patientId} />
    </div>
  );
}

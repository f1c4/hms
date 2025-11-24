"use client";

import { create } from "zustand";
import {
  createPatientSlice,
  PatientSlice,
} from "@/features/patients/store/patient-slice";
import { MedicalHistorySlice } from "@/features/patients/patient-medical-history-tab/slice";
import { createJSONStorage, persist } from "zustand/middleware";

// Define the shape of the persisted state
type PersistedState = {
  patient: {
    activeTab?: PatientSlice["patient"]["activeTab"];
    uiState?: PatientSlice["patient"]["uiState"];
    medicalHistory?: Partial<MedicalHistorySlice["medicalHistory"]>;
  };
};

export const useMainStore = create<PatientSlice>()(
  persist(
    (...a) => ({
      ...createPatientSlice(...a),
    }),
    {
      name: "webmed-patient-ui-state",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state): PersistedState => ({
        patient: {
          activeTab: state.patient.activeTab,
          uiState: state.patient.uiState,
          medicalHistory: {
            mode: state.patient.medicalHistory.mode,
            editingEventId: state.patient.medicalHistory.editingEventId,
            docForm: state.patient.medicalHistory.docForm,
            expandedEventIds: state.patient.medicalHistory.expandedEventIds,
          },
        },
      }),
      merge: (persistedState, currentState) => {
        const typedPersistedState = persistedState as PersistedState;

        // Perform a deep merge that respects the in-memory data
        return {
          ...currentState,
          patient: {
            ...currentState.patient,
            // Merge top-level UI state
            activeTab: typedPersistedState.patient?.activeTab ??
              currentState.patient.activeTab,
            uiState: {
              ...currentState.patient.uiState,
              ...typedPersistedState.patient?.uiState,
            },
            // Crucially, only merge the UI parts of medicalHistory,
            medicalHistory: {
              ...currentState.patient.medicalHistory,
              ...typedPersistedState.patient?.medicalHistory,
            },
          },
        };
      },
    },
  ),
);

import { StateCreator } from "zustand";
import { PatientSlice } from "../store/patient-slice";
import { PatientRisksModel } from "@/types/data-models";

export interface RiskTabSlice {
  riskActions: {
    commit: (updatedData: PatientRisksModel) => void;
  };
}

export const createRiskTabSlice: StateCreator<
  PatientSlice,
  [],
  [],
  RiskTabSlice
> = (set) => ({
  riskActions: {
    commit: (updatedData) =>
      set((state) => {
        if (!state.patient.pristineData) return {};

        const newPristineData = {
          ...state.patient.pristineData,
          risk: updatedData,
        };

        return {
          patient: {
            ...state.patient,
            pristineData: newPristineData,
            uiState: {
              ...state.patient.uiState,
              risk: {
                ...state.patient.uiState.risk,
                isEditing: false,
                isCreating: false,
              },
            },
          },
        };
      }),
  },
});

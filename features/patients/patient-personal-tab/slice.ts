import { StateCreator } from "zustand";
import { PatientSlice } from "../store/patient-slice";
import { PatientPersonalModel } from "@/types/data-models";
import { cloneDeep } from "lodash";


export interface PersonalTabSlice {
  personalActions: {
    commit: (updatedData: PatientPersonalModel) => void;
  };
}

export const createPersonalTabSlice: StateCreator<
  PatientSlice,
  [],
  [],
  PersonalTabSlice
> = (set) => ({
  // --- Actions for Personal Tab ---
  personalActions: {
    commit: (updatedData) =>
      set((state) => {
        if (!state.patient.pristineData) return {};

        const newPristineData = {
          ...state.patient.pristineData,
          personal: updatedData,
        };

        return {
          patient: {
            ...state.patient,
            pristineData: newPristineData,
            workingData: cloneDeep(newPristineData),
            uiState: {
              ...state.patient.uiState,
              personal: {
                ...state.patient.uiState.personal,
                isEditing: false,
                isCreating: false,
              },
            },
          },
        };
      }),
  },
});
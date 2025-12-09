import { StateCreator } from "zustand";

import { PatientSlice } from "../store/patient-slice";
import { PatientGeneralClientModel } from "@/types/client-models";

export interface GeneralTabSlice {
  infoActions: {
    commit: (updatedData: PatientGeneralClientModel) => void;
  };
}

export const createGeneralTabSlice: StateCreator<
  PatientSlice,
  [],
  [],
  GeneralTabSlice
> = (set) => ({
  infoActions: {
    commit: (updatedData: PatientGeneralClientModel) =>
      set((state) => {
        if (!state.patient.pristineData) return {};

        const newPristineData = {
          ...state.patient.pristineData,
          general: updatedData,
        };

        return {
          patient: {
            ...state.patient,
            patientId: updatedData.id,
            pristineData: newPristineData,
            uiState: {
              ...state.patient.uiState,
              general: {
                ...state.patient.uiState.general,
                info: {
                  ...state.patient.uiState.general.info,
                  mode: "view",
                  isDirty: false,
                },
              },
            },
          },
        };
      }),
  },
});

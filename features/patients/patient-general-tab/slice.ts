import { StateCreator } from "zustand";
import { cloneDeep } from "lodash";

import { PatientSlice } from "../store/patient-slice";
import { transformGeneralDataForClient } from "../store/client-transform";
import { PatientGeneralModel } from "@/types/data-models";

export interface GeneralTabSlice {
  infoActions: {
    commit: (updatedData: PatientGeneralModel) => void;
  };
}

export const createGeneralTabSlice: StateCreator<
  PatientSlice,
  [],
  [],
  GeneralTabSlice
> = (set) => ({
  infoActions: {
    commit: (updatedData: PatientGeneralModel) =>
      set((state) => {
        if (!state.patient.pristineData) return {};

        const clientReadyData = transformGeneralDataForClient(updatedData);

        const newPristineData = {
          ...state.patient.pristineData,
          general: clientReadyData,
        };

        return {
          patient: {
            ...state.patient,
            patientId: clientReadyData.id,
            pristineData: newPristineData,
            workingData: cloneDeep(newPristineData),
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

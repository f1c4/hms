import { StateCreator } from "zustand";
import { cloneDeep } from "lodash";

import { PatientSlice } from "../store/patient-slice";
import { transformIdDocumentForClient, transformInsuranceForClient } from "../store/client-transform";
import { PatientIdDocumentModel, PatientInsuranceModel } from "@/types/data-models";

export interface DocumentsTabSlice {
  docActions: {
    commitCreation: (savedDocument: PatientIdDocumentModel) => void;
    commitUpdate: (savedDocument: PatientIdDocumentModel) => void;
    commitDeletion: (documentId: number) => void;
  };

    insuranceActions: {
    commitCreation: (savedInsurance: PatientInsuranceModel) => void;
    commitUpdate: (savedInsurance: PatientInsuranceModel) => void;
    commitDeletion: (insuranceId: number) => void;
  };
}

export const createDocumentsTabSlice: StateCreator<
  PatientSlice,
  [],
  [],
  DocumentsTabSlice
> = (set) => ({

  // --- Actions for Identity Documents ---
  docActions: {
    commitCreation: (savedDocument) => {
      set((state) => {
        if (!state.patient.pristineData) return {};

        const clientReadyDoc = transformIdDocumentForClient(savedDocument);
        const newDocs = [...(state.patient.pristineData.id_documents ?? []), clientReadyDoc];
        const newPristineData = { ...state.patient.pristineData, id_documents: newDocs };

        return {
          patient: {
            ...state.patient,
            pristineData: newPristineData,
            workingData: cloneDeep(newPristineData),
          },
        };
      });
    },

    commitUpdate: (savedDocument) => {
      set((state) => {
        if (!state.patient.pristineData?.id_documents) return {};

        const clientReadyDoc = transformIdDocumentForClient(savedDocument);
        const newDocs = state.patient.pristineData.id_documents.map((doc) =>
          doc.id === clientReadyDoc.id ? clientReadyDoc : doc
        );
        const newPristineData = { ...state.patient.pristineData, id_documents: newDocs };

        return {
          patient: {
            ...state.patient,
            pristineData: newPristineData,
            workingData: cloneDeep(newPristineData),
          },
        };
      });
    },

    commitDeletion: (documentId) => {
      set((state) => {
        if (!state.patient.pristineData?.id_documents) return {};

        const newDocs = state.patient.pristineData.id_documents.filter((doc) => doc.id !== documentId);
        const newPristineData = { ...state.patient.pristineData, id_documents: newDocs };

        return {
          patient: {
            ...state.patient,
            pristineData: newPristineData,
            workingData: cloneDeep(newPristineData),
          },
        };
      });
    },
  },

    // --- Actions for Insurances ---
  insuranceActions: {
    commitCreation: (savedInsurance) => {
      set((state) => {
        if (!state.patient.pristineData) return {};

        const clientReadyIns = transformInsuranceForClient(savedInsurance);
        const newInsurances = [
          ...(state.patient.pristineData.insurances ?? []),
          clientReadyIns,
        ];
        const newPristineData = {
          ...state.patient.pristineData,
          insurances: newInsurances,
        };

        return {
          patient: {
            ...state.patient,
            pristineData: newPristineData,
            workingData: cloneDeep(newPristineData),
          },
        };
      });
    },

    commitUpdate: (savedInsurance) => {
      set((state) => {
        if (!state.patient.pristineData?.insurances) return {};

        const clientReadyIns = transformInsuranceForClient(savedInsurance);
        const newInsurances = state.patient.pristineData.insurances.map(
          (ins) => (ins.id === clientReadyIns.id ? clientReadyIns : ins)
        );
        const newPristineData = {
          ...state.patient.pristineData,
          insurances: newInsurances,
        };

        return {
          patient: {
            ...state.patient,
            pristineData: newPristineData,
            workingData: cloneDeep(newPristineData),
          },
        };
      });
    },

    commitDeletion: (insuranceId) => {
      set((state) => {
        if (!state.patient.pristineData?.insurances) return {};

        const newInsurances = state.patient.pristineData.insurances.filter(
          (ins) => ins.id !== insuranceId
        );
        const newPristineData = {
          ...state.patient.pristineData,
          insurances: newInsurances,
        };

        return {
          patient: {
            ...state.patient,
            pristineData: newPristineData,
            workingData: cloneDeep(newPristineData),
          },
        };
      });
    },
  },
});
import { StateCreator } from "zustand";
import {
  createGeneralTabSlice,
  GeneralTabSlice,
} from "../patient-general-tab/slice";
import {
  createPersonalTabSlice,
  PersonalTabSlice,
} from "../patient-personal-tab/slice";
import { createRiskTabSlice, RiskTabSlice } from "../patient-risks-tab/slice";
import { createNotesTabSlice, NotesTabSlice } from "../patient-notes-tab/slice";
import {
  createDocumentsTabSlice,
  DocumentsTabSlice,
} from "../patient-documents-tab/slice";
import {
  createMedicalHistorySlice,
  MedicalHistorySlice,
} from "../patient-medical-history-tab/slice";
import { FullPatientClientModel } from "@/types/client-models";
import { createNewPatientData } from "./create-new-patient-data";
import {
  createUiStateForNewPatient,
  initialUIState,
} from "./create-inital-uiStates";
import {
  transformGeneralDataForClient,
  transformIdDocumentForClient,
  transformInsuranceForClient,
} from "./client-transform";
import { FullPatientDataModel } from "@/types/data-models";

export type SectionMode = "view" | "edit" | "create";

export type SectionState = {
  mode: SectionMode;
  isDirty: boolean;
};

type TabUiState<T extends string> = {
  [K in T]: SectionState;
};

export interface PatientSlice {
  patient: {
    patientId: number | null;
    pristineData: FullPatientClientModel | null;
    isInitialized: boolean;
    activeTab: string;
    uiState: {
      general: TabUiState<"info">;
      documents: TabUiState<"idDocs" | "insurance">;
      personal: TabUiState<"info">;
      risk: TabUiState<"info">;
      medical: TabUiState<"info">;
      notes: TabUiState<"info">;
    };
    actions: {
      initialize: (patient: FullPatientDataModel) => void;
      createDefaultPatientData: () => void;
      clearPatientState: () => void;
      setActiveTab: (tab: string) => void;
      setSectionState: <
        T extends keyof PatientSlice["patient"]["uiState"],
        S extends keyof PatientSlice["patient"]["uiState"][T],
      >(
        tab: T,
        section: S,
        newState: Partial<SectionState>,
      ) => void;
    };
    infoActions: GeneralTabSlice["infoActions"];
    docActions: DocumentsTabSlice["docActions"];
    insuranceActions: DocumentsTabSlice["insuranceActions"];
    personalActions: PersonalTabSlice["personalActions"];
    riskActions: RiskTabSlice["riskActions"];
    medicalHistoryActions: MedicalHistorySlice["medicalHistoryActions"];
    medicalHistory: MedicalHistorySlice["medicalHistory"];
    notesActions: NotesTabSlice["notesActions"];
  };
}

export const createPatientSlice: StateCreator<
  PatientSlice,
  [],
  [],
  PatientSlice
> = (set, get, api) => {
  const generalTabSlice = createGeneralTabSlice(set, get, api);
  const documentsTabSlice = createDocumentsTabSlice(set, get, api);
  const personalTabSlice = createPersonalTabSlice(set, get, api);
  const riskTabSlice = createRiskTabSlice(set, get, api);
  const medicalHistoryTabSlice = createMedicalHistorySlice(set, get, api);
  const notesTabSlice = createNotesTabSlice(set, get, api);

  return {
    patient: {
      patientId: null,
      pristineData: null,
      isInitialized: false,
      activeTab: "general",
      uiState: initialUIState,
      actions: {
        initialize: (patientData) => {
          const generalClientData = transformGeneralDataForClient(
            patientData.general,
          );
          const idDocumentsClientData =
            patientData.id_documents?.map(transformIdDocumentForClient) ?? null;
          const insuranceClientData =
            patientData.insurances?.map(transformInsuranceForClient) ?? null;
          const notesClientData = patientData.notes?.map((note) => ({
            ...note,
            created_at: new Date(note.created_at),
            updated_at: note.updated_at ? new Date(note.updated_at) : null,
            note: note.note || {},
          })) ?? null;

          const clientReadyData: FullPatientClientModel = {
            ...patientData,
            general: generalClientData,
            id_documents: idDocumentsClientData,
            insurances: insuranceClientData,
            notes: notesClientData,
          };

          set((state) => ({
            patient: {
              ...state.patient,
              patientId: patientData.general.id,
              pristineData: clientReadyData,
              isInitialized: true,
              activeTab: state.patient.activeTab,
              uiState: initialUIState,
            },
          }));
        },
        setActiveTab: (tab) => {
          set((state) => ({
            patient: {
              ...state.patient,
              activeTab: tab,
            },
          }));
        },
        createDefaultPatientData: () => {
          set((state) => ({
            patient: {
              ...state.patient,
              patientId: null,
              pristineData: createNewPatientData(),
              isInitialized: true,
              activeTab: "general",
              uiState: createUiStateForNewPatient(),
            },
          }));
        },
        clearPatientState: () => {
          get().patient.medicalHistoryActions.clearMedicalHistory();
          set((state) => ({
            patient: {
              ...state.patient,
              patientId: null,
              pristineData: null,
              isInitialized: false,
              // keep activeTab unchanged intentionally
              uiState: initialUIState,
            },
          }));
        },
        setSectionState: (tab, section, newState) =>
          set((state) => ({
            patient: {
              ...state.patient,
              uiState: {
                ...state.patient.uiState,
                [tab]: {
                  ...state.patient.uiState[tab],
                  [section]: {
                    ...state.patient.uiState[tab][section],
                    ...newState,
                  },
                },
              },
            },
          })),
      },
      ...generalTabSlice,
      ...documentsTabSlice,
      ...personalTabSlice,
      ...riskTabSlice,
      ...medicalHistoryTabSlice,
      ...notesTabSlice,
    },
  };
};

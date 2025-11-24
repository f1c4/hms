import {
  MedicalHistoryDocumentClientModel,
  MedicalHistoryEventClientModel,
} from "@/types/client-models";
import { MedicalHistoryEventModel } from "@/types/data-models";
import { StateCreator } from "zustand";
import { PatientSlice } from "../store/patient-slice";
import { transformMedicalHistoryForClient } from "../store/client-transform";

export type MedicalHistoryMode = "view" | "create" | "edit";

export interface MedicalHistorySlice {
  medicalHistory: {
    data: MedicalHistoryEventClientModel[] | null;
    isLoading: boolean;
    isInitialized: boolean;
    // --- UI State Management ---
    mode: MedicalHistoryMode;
    editingEventId: number | null;
    docForm: {
      isOpen: boolean;
      mode: Omit<MedicalHistoryMode, "view">;
      parentEventId: number | null;
      editingDocumentId: number | null;
    };
    expandedEventIds: number[];
  };

  medicalHistoryActions: {
    initializeMedicalHistory: (
      history: MedicalHistoryEventModel[] | null,
    ) => void;
    clearMedicalHistory: () => void;
    addEvent: (event: MedicalHistoryEventClientModel) => void;
    updateEvent: (event: MedicalHistoryEventClientModel) => void;
    // --- UI State Actions ---
    setMode: (mode: MedicalHistoryMode, eventId?: number) => void;
    closeForm: () => void;
    openDocumentForm: (
      mode: Omit<MedicalHistoryMode, "view">,
      parentEventId: number,
      editingDocumentId?: number,
    ) => void;
    closeDocumentForm: () => void;
    addDocument: (document: MedicalHistoryDocumentClientModel) => void;
    updateDocument: (document: MedicalHistoryDocumentClientModel) => void;
    removeDocument: (documentId: number) => void;
    setExpandedEvents: (eventIds: number[]) => void;
    toggleEventExpansion: (eventId: number) => void;
  };
}

const initialMedicalHistoryState: MedicalHistorySlice["medicalHistory"] = {
  data: null,
  isLoading: true,
  isInitialized: false,
  // --- Initial UI State ---
  mode: "view",
  editingEventId: null,
  docForm: {
    isOpen: false,
    mode: "create",
    parentEventId: null,
    editingDocumentId: null,
  },
  expandedEventIds: [],
};

export const createMedicalHistorySlice: StateCreator<
  PatientSlice,
  [],
  [],
  MedicalHistorySlice
> = (set, get) => ({
  medicalHistory: initialMedicalHistoryState,
  medicalHistoryActions: {
    initializeMedicalHistory: (history) => {
      const clientData = history
        ? transformMedicalHistoryForClient(history)
        : null;

      const prevExpanded = get().patient.medicalHistory.expandedEventIds ?? [];
      const validIds = clientData?.map((e) => e.id) ?? [];
      const prunedExpanded = prevExpanded.filter((id) => validIds.includes(id));
      set((state) => ({
        patient: {
          ...state.patient,
          medicalHistory: {
            ...state.patient.medicalHistory,
            data: clientData,
            isLoading: false,
            isInitialized: true,
            expandedEventIds: prunedExpanded,
          },
        },
      }));
    },
    clearMedicalHistory: () => {
      set((state) => ({
        patient: {
          ...state.patient,
          medicalHistory: initialMedicalHistoryState,
        },
      }));
    },
    addEvent: (event) => {
      set((state) => {
        const existingEvents = state.patient.medicalHistory.data || [];
        const newEvents = [...existingEvents, event];
        newEvents.sort((a, b) =>
          a.event_date.getTime() - b.event_date.getTime()
        );

        const expanded = state.patient.medicalHistory.expandedEventIds || [];
        const shouldAdd = !expanded.includes(event.id);

        return {
          patient: {
            ...state.patient,
            medicalHistory: {
              ...state.patient.medicalHistory,
              data: newEvents,
              expandedEventIds: shouldAdd ? [...expanded, event.id] : expanded,
            },
          },
        };
      });
    },
    updateEvent: (updatedEvent) => {
      set((state) => {
        const updatedData = state.patient.medicalHistory.data
          ? state.patient.medicalHistory.data.map((event) =>
            event.id === updatedEvent.id ? updatedEvent : event
          )
          : [];

        // Re-sort the entire list by date to handle date changes
        updatedData.sort((a, b) =>
          a.event_date.getTime() - b.event_date.getTime()
        );

        return {
          patient: {
            ...state.patient,
            medicalHistory: {
              ...state.patient.medicalHistory,
              data: updatedData,
            },
          },
        };
      });
    },
    // --- UI State Action Implementations ---
    setMode: (mode, eventId) => {
      set((state) => ({
        patient: {
          ...state.patient,
          medicalHistory: {
            ...state.patient.medicalHistory,
            mode: mode,
            editingEventId: eventId ?? null,
          },
        },
      }));
    },
    closeForm: () => {
      set((state) => ({
        patient: {
          ...state.patient,
          medicalHistory: {
            ...state.patient.medicalHistory,
            mode: "view",
            editingEventId: null,
          },
        },
      }));
    },
    openDocumentForm: (mode, parentEventId, editingDocumentId) => {
      set((state) => ({
        patient: {
          ...state.patient,
          medicalHistory: {
            ...state.patient.medicalHistory,
            docForm: {
              isOpen: true,
              mode,
              parentEventId,
              editingDocumentId: editingDocumentId ?? null,
            },
          },
        },
      }));
    },
    closeDocumentForm: () => {
      set((state) => ({
        patient: {
          ...state.patient,
          medicalHistory: {
            ...state.patient.medicalHistory,
            docForm: {
              isOpen: false,
              mode: "create",
              parentEventId: null,
              editingDocumentId: null,
            },
          },
        },
      }));
    },
    addDocument: (document) => {
      set((state) => {
        if (!state.patient.medicalHistory.data) return state;

        const newData = state.patient.medicalHistory.data.map((event) => {
          if (event.id !== document.event_id) {
            return event;
          }
          return {
            ...event,
            documents: [...event.documents, document],
            updated_at: new Date().toISOString(),
          };
        });

        return {
          patient: {
            ...state.patient,
            medicalHistory: { ...state.patient.medicalHistory, data: newData },
          },
        };
      });
    },
    updateDocument: (document) => {
      set((state) => {
        if (!state.patient.medicalHistory.data) return state;

        const newData = state.patient.medicalHistory.data.map((event) => {
          if (event.id !== document.event_id) {
            return event;
          }
          return {
            ...event,
            documents: event.documents.map((doc) =>
              doc.id === document.id ? document : doc
            ),
            updated_at: new Date().toISOString(),
          };
        });

        return {
          patient: {
            ...state.patient,
            medicalHistory: { ...state.patient.medicalHistory, data: newData },
          },
        };
      });
    },
    removeDocument: (documentId) => {
      set((state) => {
        if (!state.patient.medicalHistory.data) return state;

        const newData = state.patient.medicalHistory.data.map((event) => {
          if (!event.documents.some((doc) => doc.id === documentId)) {
            return event;
          }
          return {
            ...event,
            documents: event.documents.filter((doc) => doc.id !== documentId),
            updated_at: new Date().toISOString(),
          };
        });

        return {
          patient: {
            ...state.patient,
            medicalHistory: { ...state.patient.medicalHistory, data: newData },
          },
        };
      });
    },
    setExpandedEvents: (eventIds) => {
      set((state) => ({
        patient: {
          ...state.patient,
          medicalHistory: {
            ...state.patient.medicalHistory,
            expandedEventIds: eventIds,
          },
        },
      }));
    },
    toggleEventExpansion: (eventId) => {
      set((state) => {
        const current = state.patient.medicalHistory.expandedEventIds ?? [];
        const exists = current.includes(eventId);
        return {
          patient: {
            ...state.patient,
            medicalHistory: {
              ...state.patient.medicalHistory,
              expandedEventIds: exists
                ? current.filter((id) => id !== eventId)
                : [...current, eventId],
            },
          },
        };
      });
    },
  },
});

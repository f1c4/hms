import { StateCreator } from "zustand";
import { PatientSlice } from "../store/patient-slice";
import { PatientNotesClientModel } from "@/types/client-models";

export interface NotesTabSlice {
  notesActions: {
    commit: (updatedData: PatientNotesClientModel) => void;
  };
}

export const createNotesTabSlice: StateCreator<
  PatientSlice,
  [],
  [],
  NotesTabSlice
> = (set) => ({
  notesActions: {
    commit: (updateData) =>
      set((state) => {
        if (!state.patient.pristineData) return {};
        const existingNotes = state.patient.pristineData.notes ?? [];
        const newNotesList = [
          ...existingNotes.filter((note) => note.id !== updateData.id),
          updateData,
        ];
        const newPristineData = {
          ...state.patient.pristineData,
          notes: newNotesList,
        };

        return {
          patient: {
            ...state.patient,
            pristineData: newPristineData,
          },
        };
      }),
  },
});

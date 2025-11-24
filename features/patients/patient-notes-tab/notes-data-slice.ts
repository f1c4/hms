import { StateCreator } from "zustand";
import { PatientSlice } from "../store/patient-slice";
import { PatientNotesTypeDb } from "./types";

export interface NotesTabSlice {
  notesActions: {
    commit: (updatedData: PatientNotesTypeDb["Row"]) => void;
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
        const existingNotes = state.patient.pristineData.notes || [];
        const newNotesList = [
          ...existingNotes.filter((note) => note.id !== updateData.id),
          updateData,
        ];
        const newWorkingData = {
          ...state.patient.workingData!,
          notes: newNotesList,
        };
        const newPristineData = JSON.parse(
          JSON.stringify({
            ...state.patient.pristineData!,
            notes: newNotesList,
          }),
        );

        return {
          patient: {
            ...state.patient,
            pristineData: newPristineData,
            workingData: newWorkingData,
          },
        };
      }),
  },
});

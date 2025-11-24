"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useMainStore } from "@/store/main-store";
import { createPatientNote, updatePatientNote } from "../actions/actions";
import { PatientNotesFormType } from "../schemas/schemas";
import { useShallow } from "zustand/react/shallow";
import { useTranslations } from "next-intl";

interface SaveNoteArgs {
  data: PatientNotesFormType;
  noteIdToEdit: number | null;
}

export function useNotesMutation() {
  const tValidation = useTranslations("Patient.Notes");
  const { patientId, setPristineData, setSectionState } = useMainStore(
    useShallow((state) => ({
      patientId: state.patient.patientId,
      setPristineData: state.patient.notesActions.commit,
      setSectionState: state.patient.actions.setSectionState,
    })),
  );

  return useMutation({
    mutationFn: ({ data, noteIdToEdit }: SaveNoteArgs) => {
      if (!patientId) throw new Error("Patient ID not found.");

      if (noteIdToEdit) {
        return updatePatientNote(data, noteIdToEdit);
      } else {
        return createPatientNote(data, patientId);
      }
    },
    onSuccess: (updatedData, { noteIdToEdit }) => {
      const isUpdating = !!noteIdToEdit;

      setPristineData(updatedData);

      const message = isUpdating
        ? tValidation("updateNoteSuccess")
        : tValidation("addNoteSuccess");
      toast.success(message);
    },
    onError: (error, { noteIdToEdit }) => {
      const isUpdating = !!noteIdToEdit;

      const errorMessage = isUpdating
        ? tValidation("updateNoteError")
        : tValidation("addNoteError");
      toast.error(`${errorMessage}: ${error.message}`);
      setSectionState("notes", "info", { isDirty: true });
    },
  });
}

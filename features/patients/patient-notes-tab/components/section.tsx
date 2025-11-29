"use client";

import { useState } from "react";
import { useMainStore } from "@/store/main-store";
import { useShallow } from "zustand/react/shallow";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { NotesList } from "./list";
import { NoteForm } from "./form";
import { useTranslations } from "next-intl";
import { PlusIcon } from "lucide-react";
import { PatientNotesClientModel } from "@/types/client-models";

export function NotesSection() {
  const [selectedNote, setSelectedNote] =
    useState<PatientNotesClientModel | null>(null);

  const tSection = useTranslations("Patient.Notes");
  const tCommon = useTranslations("Common.Buttons");

  const { pristineData, sectionState, setSectionState } = useMainStore(
    useShallow((state) => ({
      pristineData: state.patient.pristineData,
      sectionState: state.patient.uiState.notes.info,
      setSectionState: state.patient.actions.setSectionState,
    }))
  );

  const notes = pristineData?.notes ?? [];
  const { mode } = sectionState;
  const isCreating = mode === "create";
  const isEditing = mode === "edit";
  const showForm = isCreating || isEditing;

  const handleAdd = () => {
    setSelectedNote(null);
    setSectionState("notes", "info", { mode: "create" });
  };

  const handleEdit = (note: PatientNotesClientModel) => {
    setSelectedNote(note);
    setSectionState("notes", "info", { mode: "edit" });
  };

  const handleCloseForm = () => {
    setSelectedNote(null);
    setSectionState("notes", "info", { mode: "view" });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tSection("title")}</CardTitle>
        <CardAction>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAdd}
            disabled={showForm}
          >
            <PlusIcon className="h-4 w-4" />
            {tCommon("addButton")}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-6">
        <NotesList notes={notes} onEdit={handleEdit} />
      </CardContent>

      <Dialog
        open={showForm}
        onOpenChange={(open) => {
          if (!open) handleCloseForm();
        }}
      >
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? tSection("editNoteTitle") : tSection("addNoteTitle")}
            </DialogTitle>
            <DialogDescription />
          </DialogHeader>
          <NoteForm
            key={selectedNote?.id}
            noteToEdit={isEditing ? selectedNote : null}
            onClose={handleCloseForm}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}

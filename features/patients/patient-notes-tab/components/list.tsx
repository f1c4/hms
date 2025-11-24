"use client";

import { PatientNotesTypeDb } from "../types";
import { NotesListItem } from "./list-item";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslations } from "next-intl";

interface NotesListProps {
  notes: PatientNotesTypeDb["Row"][];
  onEdit: (note: PatientNotesTypeDb["Row"]) => void;
}

export function NotesList({ notes, onEdit }: NotesListProps) {
  const tSection = useTranslations("Patient.Notes");
  return (
    <>
      {notes.length !== 0 ? (
        <div className="rounded-md border">
          <ul className="divide-y">
            {notes.map((note) => (
              <NotesListItem key={note.id} note={note} onEdit={onEdit} />
            ))}
          </ul>
        </div>
      ) : (
        <Alert variant="default">
          <AlertDescription className="px-3 py-2 text-sm">
            {tSection("noNotesFound")}
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}

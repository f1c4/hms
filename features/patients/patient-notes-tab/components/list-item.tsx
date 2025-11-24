"use client";

import { Button } from "@/components/ui/button";
import { PatientNotesTypeDb } from "../types";
import { useFormatDate } from "@/hooks/use-format-date";

interface NotesListItemProps {
  note: PatientNotesTypeDb["Row"];
  onEdit: (note: PatientNotesTypeDb["Row"]) => void;
}

export function NotesListItem({ note, onEdit }: NotesListItemProps) {
  const formatDate = useFormatDate();
  const createdAt = formatDate(note.created_at!, "Pp");
  const updatedAt = formatDate(note.updated_at!, "Pp");

  return (
    <li key={note.id} className="flex items-center justify-between p-3">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-foreground">{note.note}</p>
        <div className="flex flex-col text-xs text-muted-foreground">
          {note.created_at && <span>Created: {createdAt}</span>}
          {note.updated_at && <span>Updated: {updatedAt}</span>}
        </div>
      </div>
      <div className="flex gap-2 pl-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(note)}>
          Edit
        </Button>
      </div>
    </li>
  );
}

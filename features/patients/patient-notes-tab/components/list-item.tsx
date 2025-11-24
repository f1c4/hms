"use client";

import { Button } from "@/components/ui/button";
import { PatientNotesTypeDb } from "../types";
import { useFormatDate } from "@/hooks/use-format-date";
import { useTranslations } from "next-intl";

interface NotesListItemProps {
  note: PatientNotesTypeDb["Row"];
  onEdit: (note: PatientNotesTypeDb["Row"]) => void;
}

export function NotesListItem({ note, onEdit }: NotesListItemProps) {
  const formatDate = useFormatDate();
  const tCommon = useTranslations("Common");
  const createdAt = formatDate(note.created_at!, "PPPp");
  const updatedAt = formatDate(note.updated_at!, "PPPp");

  return (
    <li key={note.id} className="flex items-center justify-between p-3">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-foreground">{note.note}</p>
        <div className="flex flex-col text-xs text-muted-foreground">
          {note.created_at && (
            <span>
              {tCommon("createdAt")}: {createdAt}
            </span>
          )}
          {note.updated_at && (
            <span>
              {tCommon("updatedAt")}: {updatedAt}
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-2 pl-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(note)}>
          {tCommon("Buttons.editButton")}
        </Button>
      </div>
    </li>
  );
}

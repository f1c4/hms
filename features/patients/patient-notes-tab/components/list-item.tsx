"use client";

import { Button } from "@/components/ui/button";
import { useFormatDate } from "@/hooks/use-format-date";
import { useLocale, useTranslations } from "next-intl";
import { PatientNotesClientModel } from "@/types/client-models";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NotesListItemProps {
  note: PatientNotesClientModel;
  onEdit: (note: PatientNotesClientModel) => void;
}

export function NotesListItem({ note, onEdit }: NotesListItemProps) {
  const formatDate = useFormatDate();
  const tCommon = useTranslations("Common");
  const tNotes = useTranslations("Patient.Notes");
  const createdAt = formatDate(note.created_at!, "PPPp");
  const updatedAt = formatDate(note.updated_at!, "PPPp");
  const locale = useLocale();
  const isEditable = note.ai_source_locale === locale;

  const noteText =
    note.note?.[locale] ??
    note.note?.[note.ai_source_locale] ??
    note.note?.["en"] ??
    "";

  return (
    <li key={note.id} className="flex items-center justify-between p-3">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-foreground">{noteText}</p>
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
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => isEditable && onEdit(note)}
                  disabled={!isEditable}
                >
                  {tCommon("Buttons.editButton")}
                </Button>
              </div>
            </TooltipTrigger>
            {!isEditable && (
              <TooltipContent side="left">
                {tNotes("editSourceOnly")}
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </li>
  );
}

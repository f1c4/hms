"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { NotesFieldDefinition } from "../types";

/**
 * A custom hook that returns a memoized array of personal information field definitions.
 * This encapsulates the field configuration and internationalization logic.
 * @returns An array of field definitions for the personal info form and list.
 */
export function useNotesFields(): Omit<
  NotesFieldDefinition,
  "value" | "error"
>[] {
  const tFields = useTranslations("Patient.Notes");

  const fields = useMemo(
    (): Omit<NotesFieldDefinition, "value" | "error">[] => [
      {
        name: "note",
        type: "textarea",
        label: tFields("note"),
        placeholder: tFields("notePlaceholder"),
      },
    ],
    [tFields],
  );

  return fields;
}

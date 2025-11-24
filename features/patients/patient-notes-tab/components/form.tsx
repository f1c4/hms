"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useShallow } from "zustand/react/shallow";
import { useTranslations } from "next-intl";
import { useMainStore } from "@/store/main-store";
import { useNotesFields } from "../hooks/use-fields";
import { useNotesMutation } from "../hooks/use-note-mutaion";
import {
  PatientNotesFormSchema,
  PatientNotesFormType,
} from "../schemas/schemas";
import { PatientNotesTypeDb } from "../types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { FormActions } from "@/features/patients/shared/components/form-actions";

interface NoteFormProps {
  noteToEdit?: PatientNotesTypeDb["Row"] | null;
  onClose: () => void;
}

export function NoteForm({ noteToEdit, onClose }: NoteFormProps) {
  const tValidation = useTranslations("Patient.Notes");
  const fields = useNotesFields();
  const { setSectionState, sectionState } = useMainStore(
    useShallow((state) => ({
      setSectionState: state.patient.actions.setSectionState,
      sectionState: state.patient.uiState.notes.info,
    }))
  );

  const defaultValues = useMemo<PatientNotesFormType>(
    () => ({
      note: noteToEdit?.note ?? "",
    }),
    [noteToEdit]
  );

  const form = useForm<PatientNotesFormType>({
    resolver: zodResolver(PatientNotesFormSchema(tValidation)),
    defaultValues,
  });

  const { mutate: saveNote, isPending } = useNotesMutation();

  const onSubmit = (data: PatientNotesFormType) => {
    saveNote(
      { data, noteIdToEdit: noteToEdit?.id ?? null },
      { onSuccess: () => onClose() }
    );
  };

  // Sync dirty flag with section state
  useEffect(() => {
    const isFormDirty = form.formState.isDirty;
    if (isFormDirty !== sectionState.isDirty) {
      setSectionState("notes", "info", { isDirty: isFormDirty });
    }
  }, [form.formState.isDirty, sectionState.isDirty, setSectionState]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <fieldset disabled={isPending} className="flex flex-col gap-4">
          {fields.map((formField) => {
            const fieldName = formField.name as keyof PatientNotesFormType;
            return (
              <FormField
                key={fieldName}
                control={form.control}
                name={fieldName}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{formField.label}</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder={formField.placeholder}
                        onChange={field.onChange}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            );
          })}
        </fieldset>

        <div className="flex justify-end gap-2 pt-2">
          <FormActions
            isDirty={form.formState.isDirty}
            isPending={isPending}
            onCancel={onClose}
            onReset={() => form.reset(defaultValues)}
          />
        </div>
      </form>
    </Form>
  );
}

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  MedicalHistoryEventFormInput,
  MedicalHistoryEventFormSchema,
} from "../../schemas/event-form-schemas";
import { useEventMutations } from "./use-event-mutation"; // Updated import
import { useTranslations } from "next-intl";
import { MedicalHistoryEventClientModel } from "@/types/client-models";
import { useLocale } from "next-intl";
import { useEffect } from "react";

export const useMedicalEventForm = (
  onSuccess?: () => void,
  initialData?: MedicalHistoryEventClientModel | null,
) => {
  const t = useTranslations("Patient.MedicalHistory.Validation");
  const locale = useLocale();
  const isEditMode = !!initialData;

  // Use the new consolidated hook
  const { createEvent, updateEvent, isProcessing } = useEventMutations();

  const form = useForm<MedicalHistoryEventFormInput>({
    resolver: zodResolver(MedicalHistoryEventFormSchema(t)),
    defaultValues: initialData
      ? {
        title: initialData.title?.[locale] ?? "",
        event_date: new Date(initialData.event_date), // Ensure it's a Date object
        diagnoses: initialData.diagnoses?.map((d) => ({
          value: d.diagnosis_code,
          label: d.diagnosis_translations?.[locale] ?? d.diagnosis_code,
        })) ?? [],
        notes: initialData.notes?.[locale] ?? "",
        version: initialData.version,
      }
      : {
        title: "",
        event_date: new Date(),
        diagnoses: [],
        notes: "",
        version: 1,
      },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title?.[locale] ?? "",
        event_date: new Date(initialData.event_date), // Ensure it's a Date object
        diagnoses: initialData.diagnoses?.map((d) => ({
          value: d.diagnosis_code,
          label: d.diagnosis_translations?.[locale] ?? d.diagnosis_code,
        })) ?? [],
        notes: initialData.notes?.[locale] ?? "",
        version: initialData.version,
      });
    } else {
      form.reset({
        title: "",
        event_date: new Date(),
        diagnoses: [],
        notes: "",
        version: 1,
      });
    }
  }, [initialData, form, locale]);

  const onSubmit = form.handleSubmit((values) => {
    const handleSuccess = () => {
      form.reset();
      onSuccess?.();
    };

    if (isEditMode) {
      updateEvent.mutate(
        { id: initialData!.id, formData: values },
        { onSuccess: handleSuccess },
      );
    } else {
      createEvent.mutate(values, { onSuccess: handleSuccess });
    }
  });

  return { form, onSubmit, isPending: isProcessing, isEditMode };
};

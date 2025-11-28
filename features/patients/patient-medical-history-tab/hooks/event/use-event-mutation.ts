"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useMainStore } from "@/store/main-store";
import { useShallow } from "zustand/react/shallow";
import { useLocale, useTranslations } from "next-intl";
import {
  createMedicalHistoryEvent,
  updateMedicalHistoryEvent,
} from "../../actions/event-actions";
import { MedicalHistoryEventFormInput } from "../../schemas/event-form-schemas";
import {
  CreateMedicalHistoryEventInput,
  UpdateMedicalHistoryEventInput,
} from "../../schemas/event-server-schemas";

/**
 * A consolidated hook to manage all mutations (create, update, delete) for Medical History Events.
 */
export function useEventMutations() {
  const t = useTranslations("Patient.MedicalHistory.Notifications");
  const locale = useLocale();
  const { patientId, medicalHistoryActions } = useMainStore(
    useShallow((state) => ({
      patientId: state.patient.patientId,
      medicalHistoryActions: state.patient.medicalHistoryActions,
    })),
  );

  // --- CREATE MUTATION ---
  const createEvent = useMutation({
    mutationFn: async (formData: MedicalHistoryEventFormInput) => {
      if (!patientId) throw new Error("Patient ID not found.");

      const input: CreateMedicalHistoryEventInput = {
        patientId: patientId,
        title: formData.title,
        event_date: formData.event_date,
        notes: formData.notes,
        diagnoses: formData.diagnoses?.map((d) => d.value) ?? [],
        ai_source_locale: locale,
      };

      return createMedicalHistoryEvent(input);
    },
    onSuccess: (result) => {
      medicalHistoryActions.addEvent(result);
      toast.success(t("createSuccess"));

      if (result.ai_translation_status === "in_progress") {
        toast.message(t("translationStarted")); // add key in messages
      } else if (result.ai_translation_status === "failed") {
        toast.warning(t("translationFailedShort"), {
          description: result.ai_translation_error || undefined,
        });
      }
    },
    onError: (error) => {
      toast.error(t("createError"), { description: error.message });
    },
  });

  // --- UPDATE MUTATION ---
  const updateEvent = useMutation({
    mutationFn: async (data: {
      id: number;
      formData: MedicalHistoryEventFormInput;
    }) => {
      const { id, formData } = data;

      const input: UpdateMedicalHistoryEventInput = {
        id: id,
        version: formData.version || 0,
        title: formData.title,
        event_date: formData.event_date,
        notes: formData.notes,
        diagnoses: formData.diagnoses?.map((d) => d.value) ?? [],
        ai_source_locale: locale,
      };

      return updateMedicalHistoryEvent(input);
    },
    onSuccess: (result) => {
      medicalHistoryActions.updateEvent(result);
      toast.success(t("updateSuccess"));

      if (result.ai_translation_status === "in_progress") {
        toast.message(t("translationStarted"));
      } else if (result.ai_translation_status === "failed") {
        toast.warning(t("translationFailedShort"), {
          description: result.ai_translation_error || undefined,
        });
      }
    },
    onError: (error) => {
      toast.error(t("updateError"), {
        description: error.message || undefined,
      });
    },
  });

  return {
    createEvent,
    updateEvent,
    isProcessing: createEvent.isPending || updateEvent.isPending,
  };
}

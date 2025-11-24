"use client";

import { useTranslations } from "next-intl";

// UI Components
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/features/patients/shared/components/date-picker";
import { FormActions } from "@/features/patients/shared/components/form-actions";
import { DialogFooter } from "@/components/ui/dialog";

// Logic and Schemas
import { useMedicalEventForm } from "../../hooks/event/use-event-form";
import { DiagnosisSelector } from "../shared/diagnosis-selector";
import { MedicalHistoryEventClientModel } from "@/types/client-models";

interface EventFormProps {
  onClose: () => void;
  initialData?: MedicalHistoryEventClientModel | null;
}

export function EventForm({ onClose, initialData }: EventFormProps) {
  const tFields = useTranslations("Patient.MedicalHistory.Form");

  const { form, onSubmit, isPending } = useMedicalEventForm(
    onClose,
    initialData
  );

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tFields("eventTitle")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isPending}
                    placeholder={tFields("eventTitlePlaceholder")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="event_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tFields("eventDate")}</FormLabel>
                <FormControl>
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isPending}
                    disableDirection="future"
                    placeholder={tFields("eventDatePlaceholder")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="diagnoses"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{tFields("diagnoses")}</FormLabel>
              <FormControl>
                <DiagnosisSelector
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{tFields("notes")}</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  disabled={isPending}
                  placeholder={tFields("notesPlaceholder")}
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <FormActions
            isDirty={form.formState.isDirty}
            isPending={isPending}
            onCancel={onClose}
            onReset={() => form.reset()}
          />
        </DialogFooter>
      </form>
    </Form>
  );
}

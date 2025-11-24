"use client";

import { Button } from "@/components/ui/button";
import { MedicalHistoryDocumentClientModel } from "@/types/client-models";
import { useTranslations } from "next-intl";
import { useMedicalDocumentForm } from "../../hooks/docs/use-doc-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { DiagnosisSelector } from "../shared/diagnosis-selector";
import { Progress } from "@/components/ui/progress";
import { FileUploader } from "@/features/patients/shared/components/file-uploader";
import { DatePicker } from "@/features/patients/shared/components/date-picker";
import { DocumentTypeSelect } from "./document-type-slector";

interface DocumentFormProps {
  onClose: () => void;
  initialData?: MedicalHistoryDocumentClientModel | null;
  parentEventId: number;
}

export function DocumentForm({
  onClose,
  initialData,
  parentEventId,
}: DocumentFormProps) {
  const t = useTranslations("Patient.MedicalHistory.Documents");
  const tCommon = useTranslations("Common.Buttons");

  const { form, onSubmit, isPending, progress, processingLabel } =
    useMedicalDocumentForm(parentEventId, onClose, initialData);

  // Watch the relevant form fields to reactively update the UI
  const wantsToRemoveFile = form.watch("wantsToRemoveFile");
  const selectedFile = form.watch("file");

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        <FormField
          control={form.control}
          name="documentType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Form.docTypeLabel")}</FormLabel>
              <FormControl>
                <DocumentTypeSelect
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
          name="documentDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{t("Form.dateLabel")}</FormLabel>
              <FormControl>
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isPending}
                  placeholder={t("Form.datePlaceholder")}
                  disableDirection="future"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="diagnoses"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Form.diagnosesLabel")}</FormLabel>
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
              <FormLabel>{t("Form.notesLabel")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("Form.notesPlaceholder")}
                  {...field}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Form.fileLabel")}</FormLabel>
              <FormControl>
                <FileUploader
                  selectedFile={field.value?.[0]}
                  onFileSelect={(file) => {
                    const dataTransfer = new DataTransfer();
                    if (file) dataTransfer.items.add(file);
                    field.onChange(dataTransfer.files);
                    // If a new file is selected, we are no longer trying to remove the old one.
                    if (file) {
                      form.setValue("wantsToRemoveFile", false);
                    }
                  }}
                  // Apply your more elegant logic here
                  existingFileName={
                    !selectedFile?.[0] && !wantsToRemoveFile
                      ? initialData?.file_name
                      : undefined
                  }
                  onRemoveExistingFile={() => {
                    form.setValue("wantsToRemoveFile", true, {
                      shouldDirty: true,
                    });
                  }}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isPending && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{processingLabel}</p>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isPending}
          >
            {tCommon("cancelButton")}
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? tCommon("saveButtonPending")
              : initialData
              ? tCommon("saveButton")
              : tCommon("createButton")}
          </Button>
        </div>
      </form>
    </Form>
  );
}

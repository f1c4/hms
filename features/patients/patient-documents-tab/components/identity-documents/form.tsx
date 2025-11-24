"use client";

import { useEffect, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { useMainStore } from "@/store/main-store";
import { useShallow } from "zustand/react/shallow";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  IdDocumentClientSchema,
  IdDocumentFormInput,
} from "../../schemas/id-doc-form-schema";
import { useIdDocumentMutations } from "../../hooks/id-documents/use-doc-mutations";
import { PatientIdDocumentClientModel } from "@/types/client-models";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FileUploader } from "../../../shared/components/file-uploader";
import { Progress } from "@/components/ui/progress";
import { DatePicker } from "@/features/patients/shared/components/date-picker";
import { useDocumentTypes } from "@/features/patients/shared/hooks/use-document-types";
import { DatabaseSelectWithAdd } from "@/features/patients/shared/components/db-select-add";
import { toast } from "sonner";
import { FormActions } from "@/features/patients/shared/components/form-actions";

type NewDocumentTypePopoverData = {
  newLabel: string;
};

function createFileList(file: File): FileList {
  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file);
  return dataTransfer.files;
}

interface DocumentFormProps {
  documentToEdit?: PatientIdDocumentClientModel | null;
  onClose: () => void;
}

export function DocumentForm({ documentToEdit, onClose }: DocumentFormProps) {
  const tValidation = useTranslations("Patient.GeneralIdDocumentValidation");
  const tFields = useTranslations("Patient.GeneralIdDocumentForm");
  const {
    documentTypes,
    isLoading: isLoadingDocTypes,
    createDocumentType,
  } = useDocumentTypes("identity_document");
  const {
    createDocument,
    updateDocument,
    isProcessing,
    progress,
    processingLabel,
  } = useIdDocumentMutations();
  const { sectionState, setSectionState } = useMainStore(
    useShallow((state) => ({
      sectionState: state.patient.uiState.documents.idDocs,
      setSectionState: state.patient.actions.setSectionState,
    }))
  );

  const locale = useLocale();
  const defaultLocale = "en";

  const documentTypeOptions = useMemo(
    () =>
      documentTypes.map((opt) => ({
        value: opt.id,
        label:
          (opt.translations as Record<string, string>)?.[locale] ??
          (opt.translations as Record<string, string>)?.[defaultLocale] ??
          "Unnamed",
      })),
    [documentTypes, locale, defaultLocale]
  );

  const defaultFormValues = useMemo(
    () => ({
      documentType: documentToEdit?.document_type ?? 0,
      documentNumber: documentToEdit?.document_number ?? "",
      issueDate: documentToEdit?.issue_date
        ? new Date(documentToEdit.issue_date)
        : undefined,
      expiryDate: documentToEdit?.expiry_date
        ? new Date(documentToEdit.expiry_date)
        : undefined,
      file: undefined,
      wantsToRemoveFile: false,
    }),
    [documentToEdit]
  );

  const form = useForm<IdDocumentFormInput>({
    resolver: zodResolver(IdDocumentClientSchema(tValidation)),
    defaultValues: defaultFormValues,
  });

  const {
    formState: { isDirty: isFormDirty },
  } = form;
  const isSectionDirty = sectionState.isDirty;
  const wantsToRemoveFile = form.watch("wantsToRemoveFile");
  const isPending =
    createDocument.isPending ||
    updateDocument.isPending ||
    createDocumentType.isPending;

  const onSubmit = (data: IdDocumentFormInput) => {
    if (documentToEdit) {
      updateDocument.mutate(
        { formData: data, existingDoc: documentToEdit },
        { onSuccess: (res) => !res.error && onClose() }
      );
    } else {
      createDocument.mutate(data, {
        onSuccess: (res) => !res.error && onClose(),
      });
    }
  };

  // Sync form dirty state with the store
  useEffect(() => {
    if (isFormDirty !== isSectionDirty) {
      setSectionState("documents", "idDocs", { isDirty: isFormDirty });
    }
  }, [isFormDirty, isSectionDirty, setSectionState]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="documentType"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor={field.name}>
                  {tFields("documentType")}
                </FormLabel>
                <FormControl>
                  <DatabaseSelectWithAdd<NewDocumentTypePopoverData>
                    id={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    options={documentTypeOptions}
                    disabled={isPending || isLoadingDocTypes}
                    isLoading={isLoadingDocTypes}
                    placeholder={tFields("documentTypePlaceholder")}
                    emptyPlaceholder={tFields("documentTypeEmptyPlaceholder")}
                    allowAddNew={true}
                    isInserting={createDocumentType.isPending}
                    onInsert={(data) => {
                      const newLabel = data.newLabel;
                      if (!newLabel || newLabel.trim() === "") {
                        toast.error("Document type label cannot be empty.");
                        return;
                      }
                      const translations = {
                        [locale]: newLabel,
                        [defaultLocale]: newLabel,
                      };
                      createDocumentType.mutate({
                        entity: "identity_document",
                        translations,
                      });
                    }}
                    addNewFields={[
                      {
                        name: "newLabel",
                        label: tFields("newDocumentTypeLabel"),
                        placeholder: tFields("newDocumentTypePlaceholder"),
                      },
                    ]}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="documentNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor={field.name}>
                  {tFields("documentNumber")}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    id={field.name}
                    disabled={isPending}
                    placeholder={tFields("documentNumberPlaceholder")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="issueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor={field.name}>
                  {tFields("issueDate")}
                </FormLabel>
                <FormControl>
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isPending}
                    disableDirection="future"
                    startMonth={new Date(1900, 0)}
                    endMonth={new Date()}
                    placeholder={tFields("issueDatePlaceholder")}
                    id={field.name}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expiryDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor={field.name}>
                  {tFields("expiryDate")}
                </FormLabel>
                <FormControl>
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isPending}
                    disableDirection="past"
                    startMonth={new Date()}
                    endMonth={new Date(new Date().getFullYear() + 50, 11)}
                    placeholder={tFields("expiryDatePlaceholder")}
                    id={field.name}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="min-w-0">
          <Controller
            name="file"
            control={form.control}
            render={({ field: { onChange, value } }) => (
              <FormItem>
                <FormLabel>{tFields("fileUploadLabel")}</FormLabel>
                <FileUploader
                  onFileSelect={(file) => {
                    form.setValue("wantsToRemoveFile", false);
                    onChange(file ? createFileList(file) : undefined);
                  }}
                  selectedFile={value?.[0]}
                  existingFileName={
                    !value?.[0] && !wantsToRemoveFile
                      ? documentToEdit?.file_name
                      : undefined
                  }
                  onRemoveExistingFile={() => {
                    form.setValue("wantsToRemoveFile", true, {
                      shouldDirty: true,
                    });
                  }}
                  disabled={isPending}
                  placeholder={tFields("fileUploadPlaceholder")}
                />
              </FormItem>
            )}
          />
          {isProcessing && (
            <div className="space-y-2 mt-2">
              <div className="flex justify-between text-sm">
                <span>{processingLabel}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <FormActions
            isDirty={form.formState.isDirty}
            isPending={isPending}
            onCancel={onClose}
            onReset={() => form.reset(defaultFormValues)}
          />
        </div>
      </form>
    </Form>
  );
}

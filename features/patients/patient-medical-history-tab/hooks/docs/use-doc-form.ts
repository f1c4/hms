import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  MedicalDocumentClientSchema,
  MedicalDocumentFormInput,
} from "../../schemas/docs-form-schema";
import { useLocale, useTranslations } from "next-intl";
import { MedicalHistoryDocumentClientModel } from "@/types/client-models";
import { useDocumentMutations } from "./use-doc-mutation";
import { toast } from "sonner";

export const useMedicalDocumentForm = (
  parentEventId: number,
  onSuccess?: () => void,
  initialData?: MedicalHistoryDocumentClientModel | null,
) => {
  const t = useTranslations("Patient.MedicalHistory.Documents.Validation");
  const locale = useLocale();
  const isEditMode = !!initialData;
  const {
    createDocument,
    updateDocument,
    isProcessing,
    progress,
    processingLabel,
  } = useDocumentMutations();

  const form = useForm<MedicalDocumentFormInput>({
    resolver: zodResolver(MedicalDocumentClientSchema(t)),
    defaultValues: {
      documentType: initialData?.document_type_id,
      documentDate: initialData?.document_date,
      notes: initialData?.notes?.[locale] || "",
      diagnoses: initialData?.diagnoses?.map((d) => ({
        value: d.diagnosis_code,
        label: d.diagnosis_translations?.[locale] ?? d.diagnosis_code,
      })) ?? [],
      file: undefined,
      wantsToRemoveFile: false,
      version: initialData?.version ?? 0,
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    // A file is required if we are creating a new document or if the user wants to remove the existing file
    const hasExistingFile = isEditMode && !values.wantsToRemoveFile;
    const hasNewFile = !!values.file?.[0];

    if (!hasExistingFile && !hasNewFile) {
      toast.error(t("fileRequired"));
      return;
    }

    if (isEditMode) {
      updateDocument.mutate({
        formData: values,
        documentId: initialData.id,
        parentEventId,
      }, {
        onSuccess: () => {
          form.reset();
          onSuccess?.();
        },
      });
    } else {
      createDocument.mutate(
        { formData: values, parentEventId },
        {
          onSuccess: () => {
            form.reset();
            onSuccess?.();
          },
        },
      );
    }
  });

  return {
    form,
    onSubmit,
    isPending: isProcessing,
    progress,
    processingLabel,
  };
};

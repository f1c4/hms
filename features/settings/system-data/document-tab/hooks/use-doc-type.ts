"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLocale } from "next-intl";
import {
  createMedicalDocumentType,
  updateMedicalDocumentType,
} from "../actions/actions-admin-document-types";
import { DocTypeFormInput } from "../schemas/doc-type-schema";

export function useDocTypeMutations() {
  const queryClient = useQueryClient();
  const locale = useLocale();

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["full-system-data"] });
  };

  // --- CREATE MUTATION ---
  const createDocType = useMutation({
    mutationFn: async (formData: DocTypeFormInput) => {
      const nameTranslations = {
        [locale]: formData.name,
      };
      const result = await createMedicalDocumentType({
        type_key: formData.key,
        name_translations: nameTranslations,
        ai_source_locale: locale,
      });
      if (result.error) throw new Error(result.error.message);
      return result;
    },
    onSuccess: () => {
      invalidateQueries();
      toast.success("Document type created successfully.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // --- UPDATE MUTATION ---
  const updateDocType = useMutation({
    mutationFn: async ({
      formData,
      docTypeId,
    }: {
      formData: DocTypeFormInput;
      docTypeId: number;
    }) => {
      const nameTranslations = {
        [locale]: formData.name,
      };
      const result = await updateMedicalDocumentType(docTypeId, {
        type_key: formData.key,
        name_translations: nameTranslations,
        ai_source_locale: locale,
      });
      if (result.error) throw new Error(result.error.message);
      return result;
    },
    onSuccess: () => {
      invalidateQueries();
      toast.success("Document type updated successfully.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    createDocType,
    updateDocType,
  };
}

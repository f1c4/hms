"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLocale } from "next-intl";
import {
  createMedicalDocumentType,
  updateMedicalDocumentType,
  deleteMedicalDocumentType,
} from "../actions/actions-admin-document-types";
import { DocTypeFormInput } from "../schemas/doc-type-schema";

export function useDocTypeMutations() {
  const queryClient = useQueryClient();
  const locale = useLocale();
  const defaultLocale = "en";

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["full-system-data"] });
  };

  // --- CREATE MUTATION ---
  const createDocType = useMutation({
    mutationFn: async (formData: DocTypeFormInput) => {
      const nameTranslations = {
        [locale]: formData.name,
        [defaultLocale]: formData.name,
      };
      const result = await createMedicalDocumentType({
        type_key: formData.key,
        name_translations: nameTranslations,
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
        [defaultLocale]: formData.name,
      };
      const result = await updateMedicalDocumentType(docTypeId, {
        type_key: formData.key,
        name_translations: nameTranslations,
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

  // --- DELETE MUTATION ---
  const deleteDocType = useMutation({
    mutationFn: async (docTypeId: number) => {
      const result = await deleteMedicalDocumentType(docTypeId);
      if (result.error) throw new Error(result.error.message);
      return result;
    },
    onSuccess: () => {
      invalidateQueries();
      toast.success("Document type deleted successfully.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    createDocType,
    updateDocType,
    deleteDocType,
  };
}
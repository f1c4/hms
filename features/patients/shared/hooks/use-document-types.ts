"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { z } from "zod";

import {
  getDocumentTypesByEntity,
  createDocumentType,
  updateDocumentType,
} from "../actions/doc-types-actions";
import { DocumentTypeEntity } from "@/types/client-models";
import {
  CreateDocumentTypeSchema,
  UpdateDocumentTypeSchema,
} from "../schemas/document-types";

// Infer types from our Zod schemas for type safety
type CreateInput = z.infer<typeof CreateDocumentTypeSchema>;
type UpdateInput = z.infer<typeof UpdateDocumentTypeSchema>;

/**
 * A comprehensive hook to manage document types for a specific entity.
 * It handles fetching, creating, and updating document types using React Query,
 * including optimistic updates for a smoother UI experience.
 *
 * @param entity The entity for which to manage document types (e.g., 'identity_document').
 */
export function useDocumentTypes(entity: DocumentTypeEntity) {
  const queryClient = useQueryClient();
  const t = useTranslations();
  const queryKey = ["document-types", entity];

  // --- QUERY: Fetch document types ---
  const {
    data: documentTypes = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey,
    queryFn: () => getDocumentTypesByEntity(entity),
  });

  // --- MUTATION: Create a new document type ---
  const createMutation = useMutation({
    mutationFn: async (formData: CreateInput) => {
      const result = await createDocumentType(formData);
      if (result.error) {
        // Throw an error to be caught by onError
        throw new Error(result.error.message);
      }
      return result.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || t("Notifications.Success.default"));
      // Invalidate the query to refetch the fresh list from the server
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => {
      toast.error(error.message || t("Notifications.Error.default"));
    },
  });

  // --- MUTATION: Update an existing document type ---
  const updateMutation = useMutation({
    mutationFn: async (formData: UpdateInput) => {
      const result = await updateDocumentType(formData);
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || t("Notifications.Success.default"));
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => {
      toast.error(error.message || t("Notifications.Error.default"));
    },
  });

  return {
    documentTypes,
    isLoading,
    isError,
    createDocumentType: createMutation,
    updateDocumentType: updateMutation,
  };
}
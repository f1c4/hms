"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLocale } from "next-intl";
import { createInsuranceProvider, updateInsuranceProvider, deleteInsuranceProvider } from "../actions/actions-admin-insurance";
import { ProviderFormInput } from "../schemas/provider-schema";

/**
 * A hook to manage all mutations (create, update, delete) for Insurance Providers.
 */
export function useProviderMutations() {
  const queryClient = useQueryClient();
  const locale = useLocale();
  const defaultLocale = "en";

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["full-system-data"] });
  };

  // --- CREATE MUTATION ---
  const createProvider = useMutation({
    mutationFn: async (formData: ProviderFormInput) => {
      const nameTranslations = {
        [locale]: formData.name,
        [defaultLocale]: formData.name, // Default-as-Self
      };

      const result = await createInsuranceProvider({
        name_translations: nameTranslations,
        contact_info: { notes: formData.contactInfo ?? "" },
      });
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (data) => {
      invalidateQueries();
      toast.success(data?.message ?? "Provider created successfully.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // --- UPDATE MUTATION ---
  const updateProvider = useMutation({
    mutationFn: async ({
      formData,
      providerId,
    }: {
      formData: ProviderFormInput;
      providerId: number;
    }) => {
      const nameTranslations = {
        [locale]: formData.name,
        [defaultLocale]: formData.name, // Default-as-Self
      };
      const result = await updateInsuranceProvider(providerId, {
        name_translations: nameTranslations,
        contact_info: { notes: formData.contactInfo ?? "" },
      });
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (data) => {
      invalidateQueries();
      toast.success(data?.message ?? "Provider updated successfully.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // --- DELETE MUTATION ---
  const deleteProvider = useMutation({
    mutationFn: async (providerId: number) => {
      // The server-side action now handles the logic for checking if plans exist.
      const result = await deleteInsuranceProvider(providerId);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (data) => {
      invalidateQueries();
      toast.success(data?.message ?? "Provider deleted successfully.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    createProvider,
    updateProvider,
    deleteProvider,
  };
}
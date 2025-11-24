"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLocale } from "next-intl";
import { PlanFormInput } from "../schemas/plan-schema";
import {
  createInsurancePlan,
  deleteInsurancePlan,
  updateInsurancePlan,
} from "../actions/actions-admin-insurance";

/**
 * A hook to manage all mutations (create, update, delete) for Insurance Plans.
 */
export function usePlanMutations() {
  const queryClient = useQueryClient();
  const locale = useLocale();
  const defaultLocale = "en";

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["full-system-data"] });
  };

  // --- CREATE MUTATION ---
  const createPlan = useMutation({
    mutationFn: async ({
      formData,
      providerId,
    }: {
      formData: PlanFormInput;
      providerId: number;
    }) => {
      const nameTranslations = {
        [locale]: formData.name,
        [defaultLocale]: formData.name,
      };
      const descriptionTranslations = {
        [locale]: formData.description ?? "",
        [defaultLocale]: formData.description ?? "",
      };

      const result = await createInsurancePlan({
        provider_id: providerId,
        name_translations: nameTranslations,
        description_translations: descriptionTranslations,
      });
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (data) => {
      invalidateQueries();
      toast.success(data?.message ?? "Plan created successfully.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // --- UPDATE MUTATION ---
  const updatePlan = useMutation({
    mutationFn: async ({
      formData,
      planId,
    }: {
      formData: PlanFormInput;
      planId: number;
    }) => {
      const nameTranslations = {
        [locale]: formData.name,
        [defaultLocale]: formData.name,
      };
      const descriptionTranslations = {
        [locale]: formData.description ?? "",
        [defaultLocale]: formData.description ?? "",
      };

      const result = await updateInsurancePlan(planId, {
        name_translations: nameTranslations,
        description_translations: descriptionTranslations,
      });
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (data) => {
      invalidateQueries();
      toast.success(data?.message ?? "Plan updated successfully.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // --- DELETE MUTATION ---
  const deletePlan = useMutation({
    mutationFn: async (planId: number) => {
      const result = await deleteInsurancePlan(planId);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (data) => {
      invalidateQueries();
      toast.success(data?.message ?? "Plan deleted successfully.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    createPlan,
    updatePlan,
    deletePlan,
  };
}
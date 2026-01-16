"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
    createExaminationCategory,
    deleteExaminationCategory,
    updateExaminationCategory,
} from "../actions";
import type {
    ExaminationCategoryCreatePayload,
    ExaminationCategoryUpdatePayload,
} from "../schemas";

const QUERY_KEY = ["examination-categories"];

/**
 * Hook to manage all mutations for Examination Categories.
 */
export function useExaminationCategoryMutations() {
    const queryClient = useQueryClient();
    const t = useTranslations("Examinations.Notification");

    const invalidateQueries = () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    };

    // --- CREATE MUTATION ---
    const create = useMutation({
        mutationFn: async (payload: ExaminationCategoryCreatePayload) => {
            const result = await createExaminationCategory(payload);
            if (result.error) throw new Error(result.error.message);
            return result.data;
        },
        onSuccess: () => {
            invalidateQueries();
            toast.success(
                t("categoryAddSuccess") || "Category created successfully",
            );
        },
        onError: (error: Error) => {
            toast.error(
                error.message || t("categoryAddError") ||
                    "Failed to create category",
            );
        },
    });

    // --- UPDATE MUTATION ---
    const update = useMutation({
        mutationFn: async ({
            id,
            payload,
        }: {
            id: number;
            payload: ExaminationCategoryUpdatePayload;
        }) => {
            const result = await updateExaminationCategory(id, payload);
            if (result.error) throw new Error(result.error.message);
            return result.data;
        },
        onSuccess: () => {
            invalidateQueries();
            toast.success(
                t("categoryUpdateSuccess") || "Category updated successfully",
            );
        },
        onError: (error: Error) => {
            toast.error(
                error.message || t("categoryUpdateError") ||
                    "Failed to update category",
            );
        },
    });

    // --- DELETE MUTATION ---
    const deleteCategory = useMutation({
        mutationFn: async (id: number) => {
            const result = await deleteExaminationCategory(id);
            if (result.error) throw new Error(result.error.message);
            return result.data;
        },
        onSuccess: () => {
            invalidateQueries();
            toast.success(
                t("categoryDeleteSuccess") || "Category deleted successfully",
            );
        },
        onError: (error: Error) => {
            toast.error(
                error.message || t("categoryDeleteError") ||
                    "Failed to delete category",
            );
        },
    });

    return {
        createExaminationCategory: create,
        updateExaminationCategory: update,
        deleteExaminationCategory: deleteCategory,
    };
}

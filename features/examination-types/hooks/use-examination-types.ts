"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
    createExaminationType,
    deactivateExaminationType,
    getExaminationTypes,
    reactivateExaminationType,
    updateExaminationType,
} from "../actions";
import type {
    ExaminationTypeCreatePayload,
    ExaminationTypeUpdatePayload,
} from "../schemas";

const QUERY_KEY = ["examination-types"];

/**
 * Hook to fetch all examination types
 */
export function useExaminationTypes(includeInactive = false) {
    return useQuery({
        queryKey: [...QUERY_KEY, { includeInactive }],
        queryFn: async () => {
            const result = await getExaminationTypes(includeInactive);
            if (result.error) throw new Error(result.error.message);
            return result.data;
        },
    });
}

/**
 * Hook to manage all mutations for Examination Types.
 */
export function useExaminationTypeMutations() {
    const queryClient = useQueryClient();
    const t = useTranslations("Examinations.Notification");

    const invalidateQueries = () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    };

    // --- CREATE MUTATION ---
    const create = useMutation({
        mutationFn: async (payload: ExaminationTypeCreatePayload) => {
            const result = await createExaminationType(payload);
            if (result.error) throw new Error(result.error.message);
            return result.data;
        },
        onSuccess: () => {
            invalidateQueries();
            toast.success(t("addSuccess"));
        },
        onError: (error: Error) => {
            toast.error(error.message || t("addError"));
        },
    });

    // --- UPDATE MUTATION ---
    const update = useMutation({
        mutationFn: async ({
            id,
            payload,
        }: {
            id: number;
            payload: ExaminationTypeUpdatePayload;
        }) => {
            const result = await updateExaminationType(id, payload);
            if (result.error) throw new Error(result.error.message);
            return result.data;
        },
        onSuccess: () => {
            invalidateQueries();
            toast.success(t("updateSuccess"));
        },
        onError: (error: Error) => {
            toast.error(error.message || t("updateError"));
        },
    });

    // --- DEACTIVATE MUTATION ---
    const deactivate = useMutation({
        mutationFn: async (id: number) => {
            const result = await deactivateExaminationType(id);
            if (result.error) throw new Error(result.error.message);
            return result.data;
        },
        onSuccess: () => {
            invalidateQueries();
            toast.success(t("deactivateSuccess"));
        },
        onError: (error: Error) => {
            toast.error(error.message || t("deactivateError"));
        },
    });

    // --- REACTIVATE MUTATION ---
    const reactivate = useMutation({
        mutationFn: async (id: number) => {
            const result = await reactivateExaminationType(id);
            if (result.error) throw new Error(result.error.message);
            return result.data;
        },
        onSuccess: () => {
            invalidateQueries();
            toast.success(t("reactivateSuccess"));
        },
        onError: (error: Error) => {
            toast.error(error.message || t("reactivateError"));
        },
    });

    return {
        createExaminationType: create,
        updateExaminationType: update,
        deactivateExaminationType: deactivate,
        reactivateExaminationType: reactivate,
    };
}

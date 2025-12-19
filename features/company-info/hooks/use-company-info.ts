"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    getCompanyInfo,
    updateCompanyInfo,
} from "../actions/company-info-actions";
import { CompanyInfoServerInput } from "../schemas/company-info-schema";

const QUERY_KEY = ["company-info"];

/**
 * Hook to fetch the clinic's company info
 */
export function useCompanyInfo() {
    return useQuery({
        queryKey: QUERY_KEY,
        queryFn: getCompanyInfo,
    });
}

/**
 * Hook to update the clinic's company info
 */
export function useCompanyInfoMutation() {
    const queryClient = useQueryClient();

    const invalidateQueries = () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    };

    const update = useMutation({
        mutationFn: async (formData: CompanyInfoServerInput) => {
            const result = await updateCompanyInfo(formData);
            if (result.error) throw new Error(result.error.message);
            return result.data;
        },
        onSuccess: (data) => {
            invalidateQueries();
            toast.success(data?.message ?? "Company info saved successfully.");
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    return {
        updateCompanyInfo: update,
        isPending: update.isPending,
    };
}

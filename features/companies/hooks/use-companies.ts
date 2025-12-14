"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    createCompany,
    deleteCompany,
    getCompanies,
    updateCompany,
} from "../actions/companies-actions";
import { CompanyServerInput } from "../schemas/company-schema";

const QUERY_KEY = ["companies"];

/**
 * Hook to fetch all companies
 */
export function useCompanies() {
    return useQuery({
        queryKey: QUERY_KEY,
        queryFn: getCompanies,
    });
}

/**
 * Hook to manage all mutations (create, update, delete) for Companies.
 */
export function useCompanyMutations() {
    const queryClient = useQueryClient();

    const invalidateQueries = () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    };

    // --- CREATE MUTATION ---
    const create = useMutation({
        mutationFn: async (formData: CompanyServerInput) => {
            const result = await createCompany(formData);
            if (result.error) throw new Error(result.error.message);
            return result.data;
        },
        onSuccess: (data) => {
            invalidateQueries();
            toast.success(data?.message ?? "Company created successfully.");
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    // --- UPDATE MUTATION ---
    const update = useMutation({
        mutationFn: async ({
            formData,
            companyId,
        }: {
            formData: CompanyServerInput;
            companyId: number;
        }) => {
            const result = await updateCompany(companyId, formData);
            if (result.error) throw new Error(result.error.message);
            return result.data;
        },
        onSuccess: (data) => {
            invalidateQueries();
            toast.success(data?.message ?? "Company updated successfully.");
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    // --- DELETE MUTATION ---
    const remove = useMutation({
        mutationFn: async (companyId: number) => {
            const result = await deleteCompany(companyId);
            if (result.error) throw new Error(result.error.message);
            return result.data;
        },
        onSuccess: (data) => {
            invalidateQueries();
            toast.success(data?.message ?? "Company deleted successfully.");
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    return {
        createCompany: create,
        updateCompany: update,
        deleteCompany: remove,
    };
}

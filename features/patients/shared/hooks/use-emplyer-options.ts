"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { createCompany } from "@/features/companies/actions/companies-actions";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

/**
 * Fetches and formats company options for employer selection.
 * Companies have plain text names (not internationalized).
 */
export function useEmployerOptions() {
    const supabase = createClient();

    const { data: companies = [], isLoading: isLoadingEmployers } = useQuery({
        queryKey: ["companies"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("companies")
                .select("id, name")
                .order("name", { ascending: true });

            if (error) {
                console.error("Error fetching companies:", error.message);
                return [];
            }
            return data;
        },
    });

    const employerOptions = useMemo(() => {
        return companies.map((company) => ({
            value: company.id,
            label: company.name,
        }));
    }, [companies]);

    return { employerOptions, isLoadingEmployers };
}

/**
 * Provides a mutation function for creating a new company as employer.
 */
export function useEmployerMutation() {
    const queryClient = useQueryClient();
    const t = useTranslations("Patient.PersonalNotifications");

    const { mutate: insertEmployer, isPending: isInsertingEmployer } =
        useMutation({
            mutationFn: async (data: { name: string }) => {
                const result = await createCompany(
                    {
                        name: data.name,
                        type: "company",
                        discount_percentage: 0,
                        is_partner: false,
                    },
                    { skipRevalidate: true },
                );
                if ("error" in result && result.error) {
                    throw new Error(result.error.message);
                }
                return result;
            },
            onSuccess: (_result, variables) => {
                toast.success(t("employerCreated", { name: variables.name }));
                queryClient.invalidateQueries({ queryKey: ["companies"] });
            },
            onError: (error) => {
                toast.error(error.message);
            },
        });

    return { insertEmployer, isInsertingEmployer };
}

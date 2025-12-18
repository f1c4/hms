"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { createProfession } from "@/features/settings/system-data/professions-tab/actions/profession-actions";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";

/**
 * Fetches and formats profession options.
 * Handles JSONB name_translations field with locale-based display.
 */
export function useProfessionOptions() {
    const supabase = createClient();
    const locale = useLocale();

    const { data: professions = [], isLoading: isLoadingProfessions } =
        useQuery({
            queryKey: ["professions"],
            queryFn: async () => {
                const { data, error } = await supabase
                    .from("professions")
                    .select("id, name_translations")
                    .order("created_at", { ascending: false });

                if (error) {
                    console.error("Error fetching professions:", error.message);
                    return [];
                }
                return data;
            },
        });

    const professionOptions = useMemo(() => {
        return professions.map((profession) => {
            const nameObj = profession.name_translations as
                | Record<string, string>
                | null;
            const localizedName = nameObj?.[locale] ??
                nameObj?.["en"] ??
                Object.values(nameObj ?? {})[0] ??
                "Unknown";

            return {
                value: profession.id,
                label: localizedName,
            };
        });
    }, [professions, locale]);

    return { professionOptions, isLoadingProfessions };
}

/**
 * Provides a mutation function for creating a new profession.
 * Automatically passes the current locale for translation.
 */
export function useProfessionMutation() {
    const queryClient = useQueryClient();
    const locale = useLocale();
    const t = useTranslations("Patient.PersonalNotifications");

    const { mutate: insertProfession, isPending: isInsertingProfession } =
        useMutation({
            mutationFn: (data: { name: string }) =>
                createProfession({ name: data.name, sourceLocale: locale }),
            onSuccess: (result) => {
                if ("error" in result && result.error) {
                    toast.error(result.error.message);
                    return;
                }
                toast.success(t("professionCreated"));
                queryClient.invalidateQueries({ queryKey: ["professions"] });
            },
            onError: (error) => {
                toast.error(error.message);
            },
        });

    return { insertProfession, isInsertingProfession };
}

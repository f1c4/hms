"use client";

import { useQuery } from "@tanstack/react-query";
import { getExaminationCategories } from "../actions";
import { useLocale } from "next-intl";

const QUERY_KEY = ["examination-categories"];

/**
 * Hook to fetch all examination categories
 */
export function useExaminationCategories() {
    const locale = useLocale();

    return useQuery({
        queryKey: QUERY_KEY,
        queryFn: async () => {
            const result = await getExaminationCategories();
            if (result.error) throw new Error(result.error.message);
            return result.data;
        },
        select: (data) => {
            // Transform to include localized name for easier use in selects
            return data.map((cat) => ({
                ...cat,
                name: cat.name_translations[locale] ||
                    cat.name_translations["en"] ||
                    Object.values(cat.name_translations)[0] ||
                    "",
            }));
        },
    });
}

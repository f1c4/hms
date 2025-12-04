"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { createCity } from "../actions/city-actions";
import { toast } from "sonner";
import { useLocale } from "next-intl";

/**
 * Fetches and formats city options for a given country.
 * Handles JSONB name field with locale-based display.
 */
export function useCityOptions(countryId: number | null | undefined) {
  const supabase = createClient();
  const locale = useLocale();

  const { data: cities = [], isLoading: isLoadingCities } = useQuery({
    queryKey: ["cities", countryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cities")
        .select("id, name, postal_code")
        .eq("country_id", countryId!);

      if (error) {
        console.error("Error fetching cities:", error.message);
        return [];
      }
      return data;
    },
    enabled: !!countryId,
  });

  const cityOptions = useMemo(() => {
    return cities.map((city) => {
      const nameObj = city.name as Record<string, string> | null;
      const localizedName = nameObj?.[locale] ??
        nameObj?.["en"] ??
        Object.values(nameObj ?? {})[0] ??
        "Unknown";

      return {
        value: city.id,
        label: `${city.postal_code} ${localizedName}`,
      };
    });
  }, [cities, locale]);

  return { cityOptions, isLoadingCities };
}

/**
 * Provides a mutation function for creating a new city.
 * Automatically passes the current locale for translation.
 */
export function useCityMutation() {
  const queryClient = useQueryClient();
  const locale = useLocale();

  const { mutate: insertCity, isPending: isInsertingCity } = useMutation({
    mutationFn: (
      data: { name: string; postal_code: string; country_id: number },
    ) => createCity({ ...data, source_locale: locale }),
    onSuccess: (newCity, variables) => {
      const nameObj = newCity.name as Record<string, string>;
      const displayName = nameObj?.[locale] ?? variables.name;

      toast.success(`City '${displayName}' created successfully.`);
      queryClient.invalidateQueries({
        queryKey: ["cities", variables.country_id],
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return { insertCity, isInsertingCity };
}

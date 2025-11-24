"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { createCity } from "../actions/city-actions";
import { toast } from "sonner";

/**
 * Fetches and formats city options for a given country.
 * The query is only enabled when a countryId is provided.
 */
export function useCityOptions(countryId: number | null | undefined) {
  const supabase = createClient();

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
    enabled: !!countryId, // Only run the query if countryId is a truthy value
  });

  const cityOptions = useMemo(() => {
    return cities.map((city) => ({
      value: city.id,
      label: `${city.postal_code} ${city.name}`,
    }));
  }, [cities]);

  return { cityOptions, isLoadingCities };
}

/**
 * Provides a mutation function for creating a new city.
 * Handles success/error toasts and cache invalidation.
 */
export function useCityMutation() {
  const queryClient = useQueryClient();

  const { mutate: insertCity, isPending: isInsertingCity } = useMutation({
    mutationFn: createCity,
    onSuccess: (newCity, variables) => {
      toast.success(`City '${newCity.name}' created successfully.`);
      queryClient.invalidateQueries({ queryKey: ["cities", variables.country_id] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return { insertCity, isInsertingCity };
}
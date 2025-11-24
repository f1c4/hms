"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { getCountriesForSelect } from "../actions/country-actions";

/**
 * A custom hook to fetch, cache, translate, and sort the list of countries
 * for use in select components.
 *
 * @returns An object containing the formatted country options and loading state.
 */
export function useCountryOptions() {
  const tCountries = useTranslations("Countries");

  // Fetch the raw country data from Supabase
  const { data: countries = [], isLoading: isLoadingCountries } = useQuery({
    queryKey: ["countries"],
    queryFn: () => getCountriesForSelect(),
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  // Memoize the transformation of raw data into sorted, translated options
  const countryOptions = useMemo(() => {
    if (!countries || countries.length === 0) return [];

    return countries
      .map((country) => ({
        value: country.id,
        label: tCountries(country.iso2) || country.iso2, // Fallback to iso2 if translation is missing
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [countries, tCountries]);

  return { countryOptions, isLoadingCountries };
}
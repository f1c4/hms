"use server";

import { createClient } from "@/utils/supabase/server";
import { unstable_noStore as noStore } from "next/cache";
import { Json } from "@/types/database";

export type MkbSearchResult = {
  code: string;
  diagnosis_translations: Json | null;
};

// Define searchable locales in a single, easily updatable place.
const SEARCHABLE_LOCALES = ["en", "sr-Latn", "ru"];

/**
 * Searches the MKB-10 table for diagnoses matching a query.
 * @param query The search term.
 * @param limit The maximum number of results to return.
 * @returns An array of matching MKB-10 diagnoses.
 */
export async function searchMkb10(
  query: string,
  limit: number = 10,
): Promise<MkbSearchResult[]> {
  noStore();
  if (!query || query.trim().length < 2) {
    return [];
  }

  const supabase = await createClient();
  const formattedQuery = `%${query.trim()}%`;

  // 1. Dynamically create an array of query conditions for each locale.
  const localeQueries = SEARCHABLE_LOCALES.map(
    (locale) => `diagnosis_translations->>${locale}.ilike.${formattedQuery}`,
  );

  // 2. Combine the code search with the dynamic locale searches.
  const orQueryString = [
    `code.ilike.${formattedQuery}`,
    ...localeQueries,
  ].join(",");

  // 3. Execute the query with the dynamically generated 'or' condition.
  const { data, error } = await supabase
    .from("mkb_10")
    .select("code, diagnosis_translations")
    .or(orQueryString)
    .limit(limit);

  if (error) {
    console.error("Error searching MKB-10:", error);
    return [];
  }

  return data;
}

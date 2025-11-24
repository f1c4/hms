"use server";

import { createClient } from "@/utils/supabase/server";

//GET COUNTRIES FOR SELECT
export async function getCountriesForSelect() :Promise<{id: number; name: string, iso2: string}[]> {
  const client = await createClient();
  const { data, error } = await client
    .from("countries")
    .select("*")
    .order("name", { ascending: true });
  if (error) {
    console.error("Error fetching countries:", error);
    throw new Error("Failed to fetch countries.");
  }
  return data;
}
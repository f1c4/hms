"use server";

import { createClient } from "@/utils/supabase/server";
import { unstable_noStore as noStore } from "next/cache";
import { FullSystemDataModel } from "@/types/data-models";

/**
 * Fetches all system data (insurances, document types, etc.)
 * by calling the get_full_system_data PostgreSQL function.
 */
export async function getFullSystemData(): Promise<FullSystemDataModel> {
  noStore(); // Ensure we always get the latest data
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_full_system_data");

  if (error) {
    console.error("Error calling get_full_system_data:", error);
    throw new Error("Could not fetch system data.");
  }

  return data;
}
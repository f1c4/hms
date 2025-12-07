"use server";

import { createClient } from "@/utils/supabase/server";
import {
  ActionResponse,
  PatientBasicSearchParams,
  PatientListBasicResponse,
} from "../types";

// ============================================================================
// Basic Patient List Search
// ============================================================================

export async function getPatientListBasic({
  page = 1,
  limit = 20,
  firstName = "",
  lastName = "",
  nationalId = "",
  phone = "",
  sort = "created_at",
  order = "desc",
}: PatientBasicSearchParams): Promise<
  ActionResponse<PatientListBasicResponse>
> {
  const client = await createClient();
  const offset = (page - 1) * limit;

  const { data, error } = await client.rpc("get_patient_list_basic", {
    p_limit: limit,
    p_offset: offset,
    p_first_name: firstName || null,
    p_last_name: lastName || null,
    p_national_id: nationalId || null,
    p_phone: phone || null,
    p_sort: sort,
    p_order: order,
  });

  if (error) {
    console.error("Patient list fetch error:", error);
    return {
      success: false,
      errorMessage: error.message,
      data: null,
    };
  }

  // Type assertion since we've defined the return type in database-custom.ts
  return {
    success: true,
    errorMessage: null,
    data: data as PatientListBasicResponse,
  };
}

// ============================================================================
// Patient Count (standalone, for header display)
// ============================================================================

export async function getPatientCount(): Promise<ActionResponse<number>> {
  const client = await createClient();

  const { count, error } = await client
    .from("patient_general")
    .select("*", { count: "exact", head: true });

  if (error) {
    return {
      success: false,
      errorMessage: error.message,
      data: null,
    };
  }

  return {
    success: true,
    errorMessage: null,
    data: count,
  };
}

// ============================================================================
// Type Exports (for external use)
// ============================================================================

export type PatientListType = Awaited<ReturnType<typeof getPatientListBasic>>;

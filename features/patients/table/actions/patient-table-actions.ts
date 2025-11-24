"use server";

import { createClient } from "@/utils/supabase/server";

export async function getPatientCount() {
  const client = await createClient();

  const { count: totalCount, error: totalCountError } = await client
    .from("patient_general")
    .select("*", { count: "exact", head: true });

  if (totalCountError) {
    return {
      success: false,
      errorMessage: totalCountError.message,
      data: null,
    };
  }

  return {
    success: true,
    errorMessage: null,
    data: totalCount,
  };
}

interface PatientTableActionsProps {
  page?: number;
  limit?: number;
  firstName?: string;
  lastName?: string;
  searchUid?: string;
  searchDocumentNum?: string;
  sort?: string;
  order?: string;
  offset?: number;
}

export async function getPatientList({
  page = 1,
  limit = 20,
  firstName = "",
  lastName = "",
  searchUid = "",
  searchDocumentNum = "",
  sort = "created_at",
  order = "desc",
  offset = 0,
}: PatientTableActionsProps) {
  const client = await createClient();

  // Delay to test loading state
  // await new Promise((resolve) => setTimeout(resolve, 500));

  // Calculate offset if not provided
  const calculatedOffset = offset ?? (page - 1) * limit;

  // Dynamically build the `or` condition for search
  const searchConditions = [];
  if (firstName) searchConditions.push(`first_name.ilike.%${firstName}%`);
  if (lastName) searchConditions.push(`last_name.ilike.%${lastName}%`);
  if (searchUid) searchConditions.push(`uid.ilike.%${searchUid}%`);
  if (searchDocumentNum)
    searchConditions.push(`document.ilike.%${searchDocumentNum}%`);

  // Build the query
  const query = client
    .from("patient_general")
    .select("*", { count: "exact" })
    .range(calculatedOffset, calculatedOffset + limit - 1)
    .order(sort === "birth_date" ? "patient_personal(birth_date)" : sort, {
      ascending: order.toLowerCase() === "asc",
      nullsFirst: false,
    });

  // Apply search conditions only if they exist
  if (searchConditions.length > 0) {
    query.or(searchConditions.join(","));
  }

  const {
    data: patientData,
    error: patientError,
    count: filteredCount,
  } = await query;

  if (patientError) {
    return {
      success: false,
      errorMessage: patientError.message,
      data: null,
    };
  }

  // Get total count of all patients (unfiltered)
  const totalCount = await getPatientCount();

  return {
    success: true,
    errorMessage: null,
    data: { patientData, filteredCount, totalCount },
  };
}

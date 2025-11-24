"use server";

import { createClient } from "@/utils/supabase/server";

export async function getMKB10Count() {
  const client = await createClient();

  const { count: totalCount, error: totalCountError } = await client
    .from("mkb_10")
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

interface MKB10TableActionsProps {
  page?: number;
  limit?: number;
  code?: string;
  diagnosisSR?: string;
  diagnosisLat?: string;
  sort?: string;
  order?: string;
}

export const getMKB10Data = async (
  {
    page = 1,
    limit = 30,
    code = "",
    diagnosisSR = "",
    diagnosisLat = "",
    sort = "code",
    order = "asc",
  }: MKB10TableActionsProps
) => {
  const client = await createClient();

  // Calculate offset from page and limit
  const calculatedOffset = (page - 1) * limit;

  // Dynamically build the `or` condition for search
  const searchConditions = [];
  if (code) searchConditions.push(`code.ilike.%${code}%`);
  if (diagnosisSR) searchConditions.push(`diagnosis_sr.ilike.%${diagnosisSR}%`);
  if (diagnosisLat) searchConditions.push(`diagnosis_lat.ilike.%${diagnosisLat}%`);
  
  // Build the query
  const query = client
    .from("mkb_10")
    .select("*", { count: "exact" })
    .range(calculatedOffset, calculatedOffset + limit - 1)
    .order(sort, {
      ascending: order.toLowerCase() === "asc",
      nullsFirst: false,
    })

  // Apply search conditions only if they exist
  if (searchConditions.length > 0) {
    query.or(searchConditions.join(","));
  }

  const {
    data: MKBdata,
    error: MKBerror,
    count: filteredCount,
  } = await query;

  if (MKBerror) {
    return {
      success: false,
      errorMessage: MKBerror.message,
      data: null,
    };
  }

  // Get total count (use filtered count if searching, otherwise get all records count)
  let totalCount;
  if (searchConditions.length > 0) {
    // If filtering, the filtered count is our total
    totalCount = { success: true, data: filteredCount };
  } else {
    // If not filtering, get the total count of all records
    totalCount = await getMKB10Count();
  }
  
  return {
    success: true,
    errorMessage: null,
    data: { MKBdata, filteredCount, totalCount },
  };
};

export type MKB10DataType = Awaited<ReturnType<typeof getMKB10Data>>;
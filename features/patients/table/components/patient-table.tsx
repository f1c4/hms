import { PatientTableClient } from "./patient-table-client";
import { getPatientListBasic } from "../actions/patient-table-actions";
import { searchParamsCache } from "@/utils/search-params/searchparams";
import type { PatientSortField, SortOrder } from "../types";

export default async function PatientTable() {
  // Fetch the search params from the cache
  const page = searchParamsCache.get("page");
  const limit = searchParamsCache.get("limit");
  const firstName = searchParamsCache.get("firstName");
  const lastName = searchParamsCache.get("lastName");
  const nationalId = searchParamsCache.get("nationalId");
  const phone = searchParamsCache.get("phone");
  const sortParam = searchParamsCache.get("sort");
  const order = searchParamsCache.get("order");

  const sort = (sortParam as PatientSortField) ?? undefined;
  const orderValue = (order as SortOrder) ?? undefined;

  const result = await getPatientListBasic({
    page,
    limit,
    firstName,
    lastName,
    nationalId,
    phone,
    sort,
    order: orderValue,
  });

  if (!result.success || !result.data) {
    // Handle error state - you might want a proper error component
    return (
      <div className="text-destructive p-4">
        {result.errorMessage ?? "Failed to load patients"}
      </div>
    );
  }

  const { data: patients, filteredCount } = result.data;

  return <PatientTableClient data={patients} totalItems={filteredCount} />;
}

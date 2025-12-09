import { PatientTableClient } from "./patient-table-client";
import { getPatientListBasic } from "../actions/patient-table-actions";
import { searchParamsCache } from "@/utils/search-params/searchparams";
import { SortOrder, PatientSortField } from "../types";

export default async function PatientTable() {
  const page = searchParamsCache.get("page");
  const limit = searchParamsCache.get("limit");
  const firstName = searchParamsCache.get("firstName");
  const lastName = searchParamsCache.get("lastName");
  const nationalId = searchParamsCache.get("nationalId");
  const phone = searchParamsCache.get("phone");
  const sort = searchParamsCache.get("sort");
  const order = searchParamsCache.get("order");

  const result = await getPatientListBasic({
    page,
    limit,
    firstName,
    lastName,
    nationalId,
    phone,
    sort: sort as PatientSortField,
    order: order as SortOrder,
  });

  if (!result.success || !result.data) {
    return (
      <div className="flex items-center justify-center h-48 text-destructive">
        {result.errorMessage ?? "Failed to load patients"}
      </div>
    );
  }

  const { data: patients, filteredCount } = result.data;

  return <PatientTableClient data={patients} totalItems={filteredCount} />;
}

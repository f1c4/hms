import { PatientTableClient } from "./patient-table-client";
import { getPatientList } from "../actions/patient-table-actions";
import { searchParamsCache } from "@/utils/search-params/searchparams";

export default async function PatientTable() {
  // Fetch the search params from the cache
  const page = searchParamsCache.get("page");
  const limit = searchParamsCache.get("limit");
  const searchName = searchParamsCache.get("firstName");
  const searchLastName = searchParamsCache.get("lastName");
  const searchUid = searchParamsCache.get("uid");
  const searchDocumentNum = searchParamsCache.get("document");
  const sort = searchParamsCache.get("sort");
  const order = searchParamsCache.get("order");
  const offset = searchParamsCache.get("offset");

  const params = {
    page: page ?? 1,
    limit: limit ?? 20,
    firstName: searchName ?? "",
    lastName: searchLastName ?? "",
    searchUid: searchUid ?? "",
    searchDocumentNum: searchDocumentNum ?? "",
    sort: sort ?? "created_at",
    order: order ?? "desc",
    offset: offset ?? 0,
  };

  const patientListData = await getPatientList(params);
  const filteredCount = patientListData?.data?.filteredCount ?? 0;
  const totalCount = patientListData?.data?.totalCount ?? 0;

  return (
    <PatientTableClient
      data={patientListData?.data?.patientData || []}
      totalItems={filteredCount ?? totalCount ?? 0}
    />
  );
}

import { searchParams } from "@/utils/search-params/searchparams";
import { useQueryState } from "nuqs";

export function useTableFilters() {

  const [currentPage, setCurrentPage] = useQueryState("page", searchParams.page);
  const [pageSize, setPageSize] = useQueryState("limit", searchParams.limit);

  return {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
  }
}
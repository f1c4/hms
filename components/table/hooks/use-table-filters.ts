import { searchParams } from "@/utils/search-params/searchparams";
import { useQueryStates } from "nuqs";
import { useCallback, useTransition } from "react";

export function useTableFilters() {
  const [isPending, startTransition] = useTransition();

  const [tableState, setTableState] = useQueryStates(
    {
      page: searchParams.page,
      limit: searchParams.limit,
      sort: searchParams.sort,
      order: searchParams.order,
    },
    {
      startTransition,
    },
  );

  const setCurrentPage = useCallback(
    (page: number) => {
      setTableState({ page });
    },
    [setTableState],
  );

  const setPageSize = useCallback(
    (limit: number) => {
      // Reset to page 1 when changing page size
      setTableState({ limit, page: 1 });
    },
    [setTableState],
  );

  const setSort = useCallback(
    (sort: string, order: "asc" | "desc") => {
      setTableState({ sort, order });
    },
    [setTableState],
  );

  const toggleSortOrder = useCallback(
    (columnId: string) => {
      const newOrder = tableState.order === "asc" ? "desc" : "asc";
      setTableState({ sort: columnId, order: newOrder });
    },
    [tableState.order, setTableState],
  );

  return {
    // Current values
    currentPage: tableState.page,
    pageSize: tableState.limit,
    sort: tableState.sort,
    order: tableState.order,

    // Setters
    setCurrentPage,
    setPageSize,
    setSort,
    toggleSortOrder,

    // Loading state
    isPending,
  };
}

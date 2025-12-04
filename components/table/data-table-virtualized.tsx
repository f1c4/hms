"use client";

import { useCallback, useEffect, useRef } from "react";
import { ScrollBar } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  SortingState,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import TableContainer from "./table-container";
import { Spinner } from "../spinner";

interface DataTableVirtualizedProps<
  TData extends { id: string | number },
  TValue
> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  totalItems: number;
  loadedItems: number;
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  fetchNextPage: () => void;
  sorting?: SortingState;
  onSortingChange?: (
    updaterOrValue: SortingState | ((old: SortingState) => SortingState)
  ) => void;
}

export function DataTableVirtualized<
  TData extends { id: string | number },
  TValue
>({
  columns,
  data,
  totalItems,
  loadedItems,
  isLoading = false,
  isFetchingNextPage = false,
  hasNextPage = false,
  fetchNextPage,
  sorting = [],
  onSortingChange,
}: DataTableVirtualizedProps<TData, TValue>) {
  const t = useTranslations("DataTable");
  const observerRef = useRef<HTMLDivElement>(null);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualSorting: false, // Client-side sorting for loaded data
  });

  // Intersection Observer for infinite scroll
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  useEffect(() => {
    const element = observerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
      rootMargin: "100px",
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, [handleObserver]);

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col space-y-4">
        <TableContainer>
          <div className="flex items-center justify-center py-8">
            <Spinner size="small" />
          </div>
        </TableContainer>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col space-y-4 pb-4">
      <TableContainer>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              <>
                {table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-4 py-2 md:py-1">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}

                {/* Infinite scroll trigger element */}
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-20 text-center"
                  >
                    <div ref={observerRef}>
                      {isFetchingNextPage ? (
                        <div className="flex items-center justify-center gap-2">
                          <Spinner size="small" />
                          <span className="text-sm text-muted-foreground">
                            {t("tableLoadingMore")}
                          </span>
                        </div>
                      ) : hasNextPage ? (
                        <span className="text-sm text-muted-foreground">
                          {t("tableScrollForMore")}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {t("tableAllItemsLoaded")}
                        </span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              </>
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {t("tableNoResults")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </TableContainer>

      {/* Results counter */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-muted-foreground">
          {totalItems > 0 ? (
            <>
              {t("tableShowing")} {loadedItems} {t("tableOf")} {totalItems}{" "}
              {t("tableEntries")}
            </>
          ) : (
            t("tableNoEntries")
          )}
        </div>
      </div>
    </div>
  );
}

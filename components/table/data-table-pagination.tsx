"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table } from "@tanstack/react-table";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  totalItems: number;
  pageSizeOptions?: number[];
}

export function DataTablePagination<TData>({
  table,
  totalItems,
  pageSizeOptions = [10, 20, 30, 40, 50],
}: DataTablePaginationProps<TData>) {
  const t = useTranslations("DataTable");
  const { pageIndex, pageSize } = table.getState().pagination;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
      {/* Left side: Showing X to Y of Z entries */}
      <div className="text-sm text-muted-foreground">
        {totalItems > 0 ? (
          <>
            {t("tableShowing")} {pageIndex * pageSize + 1} {t("tableTo")}{" "}
            {Math.min((pageIndex + 1) * pageSize, totalItems)} {t("tableOf")}{" "}
            {totalItems} {t("tableEntries")}
          </>
        ) : (
          t("tableNoEntries")
        )}
      </div>

      <div className="flex items-center gap-4 sm:gap-6 lg:gap-8">
        {/* Rows per page selector */}
        <div className="flex items-center space-x-2">
          <p className="hidden sm:block whitespace-nowrap text-sm font-medium">
            {t("tableRowsPerPage")}
          </p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page indicator */}
        <div className="flex items-center justify-center text-sm font-medium">
          {totalItems > 0 ? (
            <>
              {t("tablePage")} {pageIndex + 1} {t("tableOf")}{" "}
              {table.getPageCount()}
            </>
          ) : (
            t("tableNoPages")
          )}
        </div>

        {/* Page navigation buttons */}
        <div className="flex items-center space-x-2">
          <Button
            aria-label="Go to first page"
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            aria-label="Go to previous page"
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            aria-label="Go to next page"
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            aria-label="Go to last page"
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}

"use client";

import TableContainer from "./table-container";
import { DataTablePagination } from "./data-table-pagination";
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
  getPaginationRowModel,
  PaginationState,
  useReactTable,
  SortingState,
  getSortedRowModel,
} from "@tanstack/react-table";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useTableFilters } from "./hooks/use-table-filters";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  totalItems: number;
  pageSizeOptions?: number[];
  onRowClick?: (row: TData) => void;
  getRowId?: (row: TData) => string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  totalItems,
  pageSizeOptions = [10, 20, 30, 40, 50],
  onRowClick,
  getRowId,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const { setPageSize, pageSize, currentPage, setCurrentPage } =
    useTableFilters();

  const t = useTranslations("DataTable");

  const paginationState: PaginationState = {
    pageIndex: currentPage - 1,
    pageSize: pageSize,
  };

  const pageCount = Math.ceil(totalItems / pageSize);

  const handlePaginationChange = (
    updaterOrValue:
      | PaginationState
      | ((old: PaginationState) => PaginationState)
  ) => {
    const pagination =
      typeof updaterOrValue === "function"
        ? updaterOrValue(paginationState)
        : updaterOrValue;

    setCurrentPage(pagination.pageIndex + 1);
    setPageSize(pagination.pageSize);
  };

  const table = useReactTable({
    data,
    columns,
    pageCount: pageCount,
    getRowId: getRowId,
    state: {
      pagination: paginationState,
      sorting: sorting,
    },
    onPaginationChange: handlePaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualFiltering: true,
  });

  return (
    <div className="flex flex-1 flex-col space-y-4">
      <TableContainer>
        <Table className="relative">
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
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={
                    onRowClick
                      ? "cursor-pointer hover:bg-muted/50 transition-colors"
                      : undefined
                  }
                  onClick={() => onRowClick?.(row.original)}
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
              ))
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

      <DataTablePagination
        table={table}
        totalItems={totalItems}
        pageSizeOptions={pageSizeOptions}
      />
    </div>
  );
}

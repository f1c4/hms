"use client";

import { useCallback } from "react";
import { DataTable } from "@/components/table/data-table";
import { useExaminationTypeColumns } from "../hooks/use-examination-type-columns";
import type { ExaminationTypeModel } from "../types/examination-types";

interface ExaminationTypeListProps {
  examinationTypes: ExaminationTypeModel[];
  onView: (item: ExaminationTypeModel) => void;
  onEdit: (item: ExaminationTypeModel) => void;
  onToggleActive: (item: ExaminationTypeModel) => void;
}

export function ExaminationTypeList({
  examinationTypes,
  onView,
  onEdit,
  onToggleActive,
}: ExaminationTypeListProps) {
  const columns = useExaminationTypeColumns({ onView, onEdit, onToggleActive });

  const handleRowClick = useCallback(
    (item: ExaminationTypeModel) => {
      onView(item);
    },
    [onView]
  );

  return (
    <DataTable
      columns={columns}
      data={examinationTypes}
      totalItems={examinationTypes.length}
      onRowClick={handleRowClick}
      getRowId={(row) => String(row.id)}
      pageSizeOptions={[10, 20, 50, 100]}
    />
  );
}

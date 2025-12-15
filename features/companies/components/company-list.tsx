"use client";

import { useCallback } from "react";
import { CompaniesTypeDb } from "@/types/data-models";
import { DataTable } from "@/components/table/data-table";
import { useCompanyColumns } from "../hooks/use-companies-columns";

interface CompanyListProps {
  companies: CompaniesTypeDb["Row"][];
  selectedCompanyId: number | null;
  onSelectCompany: (id: number) => void;
  onView: (company: CompaniesTypeDb["Row"]) => void;
  onEdit: (company: CompaniesTypeDb["Row"]) => void;
  onDelete: (company: CompaniesTypeDb["Row"]) => void;
}

export function CompanyList({
  companies,
  selectedCompanyId,
  onSelectCompany,
  onView,
  onEdit,
  onDelete,
}: CompanyListProps) {
  const columns = useCompanyColumns({ onView, onEdit, onDelete });

  const handleRowClick = useCallback(
    (company: CompaniesTypeDb["Row"]) => {
      onSelectCompany(company.id);
      onView(company);
    },
    [onSelectCompany, onView]
  );

  return (
    <DataTable
      columns={columns}
      data={companies}
      totalItems={companies.length}
      onRowClick={handleRowClick}
      getRowId={(row) => String(row.id)}
      pageSizeOptions={[10, 20, 50, 100]}
    />
  );
}

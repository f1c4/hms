"use client";

import { DataTable } from "@/components/table/data-table";
import { usePatientColumns } from "../hooks/use-patient-table-columns";
import { PatientListType } from "../actions/patient-table-actions";

interface PatientTableClientProps {
  data: PatientListType;
  totalItems: number;
}

export function PatientTableClient({
  data,
  totalItems,
}: PatientTableClientProps) {
  const patientColumns = usePatientColumns();

  return (
    <DataTable
      columns={patientColumns}
      data={data.data?.patientData ?? []}
      totalItems={totalItems}
    />
  );
}

"use client";

import { DataTable } from "@/components/table/data-table";
import { usePatientColumns } from "../hooks/use-patient-table-columns";
import { PatientObject } from "../hooks/use-patient-table-columns";

interface PatientTableClientProps {
  data: PatientObject[];
  totalItems: number;
}

export function PatientTableClient({
  data,
  totalItems,
}: PatientTableClientProps) {
  const patientColumns = usePatientColumns();

  return (
    <DataTable columns={patientColumns} data={data} totalItems={totalItems} />
  );
}

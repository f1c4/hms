// filepath: e:\Projects\hms\features\patients\table\components\patient-table-client.tsx
"use client";

import { useCallback } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useMainStore } from "@/store/main-store";
import { useShallow } from "zustand/react/shallow";
import { DataTable } from "@/components/table/data-table";
import { usePatientColumns } from "../hooks/use-patient-table-columns";
import { PatientBasicData } from "../types";

interface PatientTableClientProps {
  data: PatientBasicData[];
  totalItems: number;
}

export function PatientTableClient({
  data,
  totalItems,
}: PatientTableClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const patientColumns = usePatientColumns();

  const { setTab } = useMainStore(
    useShallow((state) => ({
      setTab: state.patient.actions.setActiveTab,
    }))
  );

  const handleRowClick = useCallback(
    (patient: PatientBasicData) => {
      setTab("general");
      router.push(`${pathname}/${patient.id}`);
    },
    [setTab, router, pathname]
  );

  return (
    <DataTable
      columns={patientColumns}
      data={data}
      totalItems={totalItems}
      onRowClick={handleRowClick}
      getRowId={(row) => String(row.id)}
    />
  );
}

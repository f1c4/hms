"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import type { MKB10DataType } from "../actions/mkb-10-actions";

export type MKB10Object = NonNullable<MKB10DataType["data"]>["MKBdata"][number];

// Custom hook to define MKB-10 table columns
export function useMKB10Columns(): ColumnDef<MKB10Object>[] {
  const t = useTranslations("DataTable");

  return useMemo(
    () => [
      {
        accessorKey: "group_name",
        header: () => {
          return <p>{t("mkb10GroupName")}</p>;
        },
        cell: ({ row }) => {
          return <p>{row.original.group_name}</p>;
        },
      },
      {
        accessorKey: "code",
        header: () => {
          return <p>{t("mkb10Code")}</p>;
        },
        cell: ({ row }) => {
          return <p>{row.original.code}</p>;
        },
      },
      {
        accessorKey: "diagnosis_sr",
        header: () => {
          return <p>{t("mkb10Diagnosis")}</p>;
        },
        cell: ({ row }) => {
          return <p>{row.original.diagnosis_sr}</p>;
        },
      },
      {
        accessorKey: "diagnosis_lat",
        header: () => {
          return <p>{t("mkb10DiagnosisLat")}</p>;
        },
        cell: ({ row }) => {
          return <p>{row.original.diagnosis_lat}</p>;
        },
      },
    ],
    [t]
  );
}

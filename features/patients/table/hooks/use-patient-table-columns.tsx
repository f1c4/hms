"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { User } from "lucide-react";
import { searchParams } from "@/utils/search-params/searchparams";
import { useQueryState } from "nuqs";
import { useLocale } from "next-intl";
import { formatFullName } from "@/utils/utils";
import { useCallback, useMemo } from "react";
import { PatientGeneralClientModel } from "@/types/client-models";

export function usePatientColumns(): ColumnDef<PatientGeneralClientModel>[] {
  const t = useTranslations("DataTable");
  const locale = useLocale();
  const [, setSortQuery] = useQueryState("sort", searchParams.sort);
  const [orderQuery, setOrderQuery] = useQueryState(
    "order",
    searchParams.order
  );

  const handleSort = useCallback(
    (columnId: string) => {
      const currentSort = orderQuery === "asc" ? "desc" : "asc";
      setSortQuery(columnId);
      setOrderQuery(currentSort);
    },
    [orderQuery, setSortQuery, setOrderQuery]
  );

  return useMemo(
    () => [
      {
        accessorKey: "name",
        id: "first_name",
        header: ({ column }) => {
          return (
            <div className="flex items-center">
              <p>{t("tableName")}</p>
              <Button
                className="ml-1 h-6 w-6"
                variant="ghost"
                size={"sm"}
                onClick={() => handleSort(column.id)}
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>
          );
        },
        cell: ({ row }) => {
          const patient = row.original;
          const fullName = formatFullName(
            patient.first_name ?? "",
            patient.last_name ?? ""
          );
          return (
            <div className="flex items-center">
              <span className="hidden md:inline-flex mr-4">
                <User className="h-5 w-5" />
              </span>
              <p>{fullName}</p>
            </div>
          );
        },
      },
      {
        accessorKey: "patient_personal",
        id: "birth_date",
        header: ({ column }) => {
          return (
            <div className="flex items-center">
              <p>{t("tableBirthDate")}</p>
              <Button
                className="ml-1 h-6 w-6"
                variant="ghost"
                size={"sm"}
                onClick={() => handleSort(column.id)}
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>
          );
        },
        cell: ({ row }) => {
          const patient = row.original.date_of_birth;
          return (
            <div>
              {patient &&
                new Date(patient).toLocaleDateString(`${locale}`, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
            </div>
          );
        },
      },
      {
        accessorKey: "address",
        header: () => {
          return <p>{t("tableAddress")}</p>;
        },
        cell: ({ row }) => {
          const patient = row.original;
          const fullAddress = [
            patient.citizenshipCountryIso2,
            patient.residenceCity,
            patient.residence_address,
          ]
            .filter((value) => value !== null && value !== undefined)
            .join(", ");
          return fullAddress.length === 0 ? null : <p>{fullAddress}</p>;
        },
      },
      {
        accessorKey: "phone",
        header: () => {
          return <p>{t("tablePhone")}</p>;
        },
      },
    ],
    [t, locale, handleSort]
  );
}

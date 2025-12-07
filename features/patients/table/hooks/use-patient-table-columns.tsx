"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, User } from "lucide-react";
import { searchParams } from "@/utils/search-params/searchparams";
import { useQueryState } from "nuqs";
import { useLocale } from "next-intl";
import { formatFullName } from "@/utils/utils";
import { useCallback, useMemo } from "react";
import { PatientBasicData } from "../types";

export function usePatientColumns(): ColumnDef<PatientBasicData>[] {
  const t = useTranslations("DataTable");
  const locale = useLocale();
  const [, setSortQuery] = useQueryState("sort", searchParams.sort);
  const [orderQuery, setOrderQuery] = useQueryState(
    "order",
    searchParams.order
  );

  const handleSort = useCallback(
    (columnId: string) => {
      const newOrder = orderQuery === "asc" ? "desc" : "asc";
      setSortQuery(columnId);
      setOrderQuery(newOrder);
    },
    [orderQuery, setSortQuery, setOrderQuery]
  );

  return useMemo(
    (): ColumnDef<PatientBasicData>[] => [
      {
        accessorKey: "firstName",
        id: "first_name",
        header: ({ column }) => (
          <div className="flex items-center">
            <p>{t("tableName")}</p>
            <Button
              className="ml-1 h-6 w-6"
              variant="ghost"
              size="sm"
              onClick={() => handleSort(column.id)}
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
        ),
        cell: ({ row }) => {
          const { firstName, lastName } = row.original;
          const fullName = formatFullName(firstName ?? "", lastName ?? "");
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
        accessorKey: "dateOfBirth",
        id: "date_of_birth",
        header: ({ column }) => (
          <div className="flex items-center">
            <p>{t("tableBirthDate")}</p>
            <Button
              className="ml-1 h-6 w-6"
              variant="ghost"
              size="sm"
              onClick={() => handleSort(column.id)}
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
        ),
        cell: ({ row }) => {
          const dateOfBirth = row.original.dateOfBirth;
          if (!dateOfBirth) return null;

          return (
            <div>
              {new Date(dateOfBirth).toLocaleDateString(locale, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </div>
          );
        },
      },
      {
        accessorKey: "nationalIdNumber",
        id: "national_id_number",
        header: () => <p>{t("tableNationalId")}</p>,
        cell: ({ row }) => {
          const nationalId = row.original.nationalIdNumber;
          return nationalId ? <p>{nationalId}</p> : null;
        },
      },
      {
        accessorKey: "phone",
        id: "phone",
        header: () => <p>{t("tablePhone")}</p>,
        cell: ({ row }) => {
          const phone = row.original.phone;
          return phone ? <p>{phone}</p> : null;
        },
      },
      {
        accessorKey: "email",
        id: "email",
        header: () => <p>{t("tableEmail")}</p>,
        cell: ({ row }) => {
          const email = row.original.email;
          return email ? (
            <p className="truncate max-w-[200px]">{email}</p>
          ) : null;
        },
      },
    ],
    [t, locale, handleSort]
  );
}

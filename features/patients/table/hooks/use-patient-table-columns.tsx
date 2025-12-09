"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, User, MapPin, Calendar, Phone, Mail } from "lucide-react";
import { useTableFilters } from "@/components/table/hooks/use-table-filters";
import { formatFullName } from "@/utils/utils";
import { formatPatientAddress } from "@/utils/localization";
import { useCallback, useMemo } from "react";
import { PatientBasicData } from "../types";

export function usePatientColumns(): ColumnDef<PatientBasicData>[] {
  const t = useTranslations("DataTable");
  const tCountries = useTranslations("Countries");
  const locale = useLocale();
  const { toggleSortOrder } = useTableFilters();

  const handleSort = useCallback(
    (columnId: string) => {
      toggleSortOrder(columnId);
    },
    [toggleSortOrder]
  );

  // Memoized address formatter with current locale
  const getAddress = useCallback(
    (patient: PatientBasicData) => {
      return formatPatientAddress(patient, locale, (iso2) => tCountries(iso2));
    },
    [locale, tCountries]
  );

  return useMemo(
    (): ColumnDef<PatientBasicData>[] => [
      {
        accessorKey: "firstName",
        id: "first_name",
        header: ({ column }) => (
          <div className="flex items-center pl-2">
            <span className="hidden md:inline-flex mr-2">
              <User className="h-5 w-5" />
            </span>
            <p>{t("tableName")}</p>
            <Button
              className="ml-1 h-6 w-6"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleSort(column.id);
              }}
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
        ),
        cell: ({ row }) => {
          const { firstName, lastName } = row.original;
          const fullName = formatFullName(firstName ?? "", lastName ?? "");
          return <p>{fullName}</p>;
        },
      },
      {
        accessorKey: "dateOfBirth",
        id: "date_of_birth",
        header: ({ column }) => (
          <div className="flex items-center pl-2">
            <span className="hidden md:inline-flex mr-2">
              <Calendar className="h-4 w-4" />
            </span>
            <p>{t("tableBirthDate")}</p>
            <Button
              className="ml-1 h-6 w-6"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleSort(column.id);
              }}
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
        ),
        cell: ({ row }) => {
          const dateOfBirth = row.original.dateOfBirth;
          if (!dateOfBirth) return null;

          return (
            <p>
              {new Date(dateOfBirth).toLocaleDateString(locale, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          );
        },
      },
      {
        id: "full_address",
        header: () => (
          <div className="flex items-center pl-2">
            <span className="hidden md:inline-flex mr-2 shrink-0">
              <MapPin className="h-4 w-4" />
            </span>
            <p>{t("tableAddress")}</p>
          </div>
        ),
        cell: ({ row }) => {
          const address = getAddress(row.original);
          return address ? (
            <p className="truncate max-w-[300px]" title={address}>
              {address}
            </p>
          ) : (
            <p className="text-muted-foreground">-</p>
          );
        },
      },
      {
        accessorKey: "phone",
        id: "phone",
        header: () => (
          <div className="flex items-center pl-2">
            <span className="hidden md:inline-flex mr-2">
              <Phone className="h-4 w-4" />
            </span>
            <p>{t("tablePhone")}</p>
          </div>
        ),
        cell: ({ row }) => {
          const phone = row.original.phone;
          return phone ? (
            <p>{phone}</p>
          ) : (
            <p className="text-muted-foreground">-</p>
          );
        },
      },
      {
        accessorKey: "email",
        id: "email",
        header: () => (
          <div className="flex items-center pl-2">
            <span className="hidden md:inline-flex mr-2">
              <Mail className="h-4 w-4" />
            </span>
            <p>{t("tableEmail")}</p>
          </div>
        ),
        cell: ({ row }) => {
          const email = row.original.email;
          return email ? (
            <p className="truncate max-w-[200px]">{email}</p>
          ) : (
            <p className="text-muted-foreground">-</p>
          );
        },
      },
    ],
    [t, locale, handleSort, getAddress]
  );
}

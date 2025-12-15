"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Building2,
  CreditCard,
  Percent,
  MoreHorizontal,
  Eye,
  PencilIcon,
  Trash2,
  Briefcase,
  Handshake,
} from "lucide-react";
import { useMemo } from "react";
import { CompaniesTypeDb } from "@/types/data-models";
import { useCompanyTypes } from "./use-company-types";

interface UseCompanyColumnsOptions {
  onView: (company: CompaniesTypeDb["Row"]) => void;
  onEdit: (company: CompaniesTypeDb["Row"]) => void;
  onDelete: (company: CompaniesTypeDb["Row"]) => void;
}

export function useCompanyColumns({
  onView,
  onEdit,
  onDelete,
}: UseCompanyColumnsOptions): ColumnDef<CompaniesTypeDb["Row"]>[] {
  const tCompanies = useTranslations("Companies");
  const tCommon = useTranslations("Common.Buttons");
  const { getLabel: getTypeLabel } = useCompanyTypes();

  return useMemo(
    (): ColumnDef<CompaniesTypeDb["Row"]>[] => [
      {
        accessorKey: "name",
        id: "name",
        header: () => (
          <div className="flex items-center pl-2">
            <span className="hidden md:inline-flex mr-2">
              <Building2 className="h-4 w-4" />
            </span>
            <p>{tCompanies("name")}</p>
          </div>
        ),
        cell: ({ row }) => {
          const name = row.original.name;
          return (
            <span
              className="truncate max-w-[200px] block font-medium"
              title={name}
            >
              {name}
            </span>
          );
        },
      },
      {
        accessorKey: "type",
        id: "type",
        header: () => (
          <div className="flex items-center pl-2">
            <span className="hidden md:inline-flex mr-2">
              <Briefcase className="h-4 w-4" />
            </span>
            <p>{tCompanies("type")}</p>
          </div>
        ),
        cell: ({ row }) => {
          const type = row.original.type;
          return (
            <Badge variant="outline" className="text-xs">
              {getTypeLabel(type)}
            </Badge>
          );
        },
      },
      {
        accessorKey: "tin",
        id: "tin",
        header: () => (
          <div className="flex items-center pl-2">
            <span className="hidden md:inline-flex mr-2">
              <CreditCard className="h-4 w-4" />
            </span>
            <p>{tCompanies("tin")}</p>
          </div>
        ),
        cell: ({ row }) => {
          const tin = row.original.tin;
          return <span>{tin || "—"}</span>;
        },
      },
      {
        accessorKey: "is_partner",
        id: "is_partner",
        header: () => (
          <div className="flex items-center justify-center">
            <span className="hidden md:inline-flex mr-2">
              <Handshake className="h-4 w-4" />
            </span>
            <p>{tCompanies("partner")}</p>
          </div>
        ),
        cell: ({ row }) => {
          const isPartner = row.original.is_partner;
          return (
            <div className="flex justify-center">
              {isPartner ? (
                <Badge variant="secondary">{tCompanies("partner")}</Badge>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "discount_percentage",
        id: "discount_percentage",
        header: () => (
          <div className="flex items-center justify-end pr-2">
            <span className="hidden md:inline-flex mr-2">
              <Percent className="h-4 w-4" />
            </span>
            <p>{tCompanies("discount")}</p>
          </div>
        ),
        cell: ({ row }) => {
          const discount = Number(row.original.discount_percentage);
          return (
            <div className="flex justify-end pr-2">
              {discount > 0 ? (
                <Badge variant="outline" className="gap-1">
                  <Percent className="h-3 w-3" />
                  {discount}
                </Badge>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: () => null,
        cell: ({ row }) => {
          const company = row.original;
          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onView(company);
                    }}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    <span>{tCommon("viewButton")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(company);
                    }}
                  >
                    <PencilIcon className="mr-2 h-4 w-4" />
                    <span>{tCommon("editButton")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(company);
                    }}
                    variant="destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>{tCommon("deleteButton")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [tCompanies, tCommon, getTypeLabel, onView, onEdit, onDelete]
  );
}

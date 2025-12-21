"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
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
  Stethoscope,
  Clock,
  DollarSign,
  MoreHorizontal,
  Eye,
  PencilIcon,
  Power,
  PowerOff,
} from "lucide-react";
import type { ExaminationTypeModel } from "../types/examination-types";

interface UseExaminationTypeColumnsOptions {
  onView: (item: ExaminationTypeModel) => void;
  onEdit: (item: ExaminationTypeModel) => void;
  onToggleActive: (item: ExaminationTypeModel) => void;
}

export function useExaminationTypeColumns({
  onView,
  onEdit,
  onToggleActive,
}: UseExaminationTypeColumnsOptions): ColumnDef<ExaminationTypeModel>[] {
  const t = useTranslations("Examinations");
  const tCommon = useTranslations("Common.Buttons");
  const locale = useLocale();

  return useMemo(
    (): ColumnDef<ExaminationTypeModel>[] => [
      {
        accessorKey: "name_translations",
        id: "name",
        header: () => (
          <div className="flex items-center pl-2">
            <span className="hidden md:inline-flex mr-2">
              <Stethoscope className="h-4 w-4" />
            </span>
            <p>{t("name")}</p>
          </div>
        ),
        cell: ({ row }) => {
          const translations = row.original.name_translations;
          const name =
            translations[locale] ||
            translations["en"] ||
            Object.values(translations)[0] ||
            "—";
          const isActive = row.original.is_active;
          return (
            <div className="flex items-center gap-2">
              <span
                className={`truncate max-w-[200px] block font-medium ${
                  !isActive ? "text-muted-foreground line-through" : ""
                }`}
                title={name}
              >
                {name}
              </span>
              {!isActive && (
                <Badge variant="secondary" className="text-xs">
                  {t("inactive")}
                </Badge>
              )}
              {row.original.color && (
                <span
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: row.original.color }}
                  title={row.original.category || ""}
                />
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "category",
        id: "category",
        header: () => t("category"),
        cell: ({ row }) => {
          const category = row.original.category;
          return category ? (
            <Badge variant="outline" className="text-xs">
              {category}
            </Badge>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        },
      },
      {
        accessorKey: "duration_minutes",
        id: "duration",
        header: () => (
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 hidden md:inline-flex" />
            <p>{t("duration")}</p>
          </div>
        ),
        cell: ({ row }) => {
          const minutes = row.original.duration_minutes;
          return (
            <span>
              {minutes} {t("minutes")}
            </span>
          );
        },
      },
      {
        accessorKey: "base_price",
        id: "price",
        header: () => (
          <div className="flex items-center justify-end pr-2">
            <DollarSign className="h-4 w-4 mr-2 hidden md:inline-flex" />
            <p>{t("price")}</p>
          </div>
        ),
        cell: ({ row }) => {
          const price = row.original.base_price;
          return (
            <div className="text-right pr-2">
              {price != null ? (
                <span>{price.toFixed(2)}</span>
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
          const item = row.original;
          const isActive = item.is_active;
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
                      onView(item);
                    }}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    <span>{tCommon("viewButton")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(item);
                    }}
                  >
                    <PencilIcon className="mr-2 h-4 w-4" />
                    <span>{tCommon("editButton")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleActive(item);
                    }}
                    variant={isActive ? "destructive" : "default"}
                  >
                    {isActive ? (
                      <>
                        <PowerOff className="mr-2 h-4 w-4" />
                        <span>{t("deactivate")}</span>
                      </>
                    ) : (
                      <>
                        <Power className="mr-2 h-4 w-4" />
                        <span>{t("reactivate")}</span>
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [t, tCommon, locale, onView, onEdit, onToggleActive]
  );
}

"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useLocale, useTranslations } from "next-intl";
import { PatientInsuranceClientModel } from "@/types/client-models";
import {
  File as FileIcon,
  FileText,
  Loader2,
  MoreHorizontal,
  PencilIcon,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface InsuranceListItemProps {
  item: PatientInsuranceClientModel;
  isLoading: boolean;
  onEdit: (item: PatientInsuranceClientModel) => void;
  onDelete: (item: PatientInsuranceClientModel) => void;
  onOpenFile: (item: PatientInsuranceClientModel) => void;
  isDisabled?: boolean;
}

export function InsuranceListItem({
  item,
  isLoading,
  onEdit,
  onDelete,
  onOpenFile,
  isDisabled = false,
}: InsuranceListItemProps) {
  const locale = useLocale();
  const t = useTranslations("Patient");
  const tCommon = useTranslations("Common.Buttons");
  const defaultLocale = "en";
  const hasFile = !!item.file_path;

  const providerName =
    item.plan.provider.name_translations?.[locale] ??
    item.plan.provider.name_translations?.[defaultLocale] ??
    t("GeneralInsurance.unknownProvider");

  const planName =
    item.plan.name_translations?.[locale] ??
    item.plan.name_translations?.[defaultLocale] ??
    t("GeneralInsurance.unknownPlan");

  return (
    <li className="flex items-center justify-between p-3">
      <button
        type="button"
        onClick={() => onOpenFile(item)}
        disabled={!hasFile || isLoading}
        className={cn(
          "flex items-center gap-3 text-left",
          hasFile
            ? "cursor-pointer hover:opacity-80 transition-opacity"
            : "cursor-default"
        )}
      >
        <FileText
          className={cn(
            "h-5 w-5 shrink-0",
            hasFile ? "text-primary" : "text-muted-foreground"
          )}
        />
        <div className="flex flex-col text-sm text-muted-foreground grow gap-1 min-w-0">
          <div className="flex items-start gap-2">
            <p
              className="font-medium text-foreground text-base truncate"
              title={providerName}
            >
              {providerName}
            </p>
            <div className="flex items-center gap-1">
              <Badge variant={item.is_active ? "secondary" : "destructive"}>
                {item.is_active
                  ? t("GeneralInsurance.active")
                  : t("GeneralInsurance.inactive")}
              </Badge>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
          </div>
          <div className="truncate">
            <p className="truncate" title={planName}>
              {planName}
            </p>
            <p className="text-xs" title={item.policy_number}>
              {t("GeneralInsurance.policyNumberLabel")}: {item.policy_number}
            </p>
          </div>
        </div>
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            disabled={isDisabled || isLoading}
            className="shrink-0"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => onOpenFile(item)}
            disabled={!hasFile || isLoading}
          >
            <FileIcon className="mr-2 h-4 w-4" />
            <span>{tCommon("openButton", { default: "Open" })}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onEdit(item)}>
            <PencilIcon className="mr-2 h-4 w-4" />
            <span>{tCommon("editButton")}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDelete(item)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>{tCommon("deleteButton")}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
}

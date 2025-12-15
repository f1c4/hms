"use client";

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
import { CompaniesTypeDb } from "@/types/data-models";
import { cn } from "@/lib/utils";
import {
  Building2,
  Percent,
  Eye,
  PencilIcon,
  Trash2,
  MoreHorizontal,
} from "lucide-react";

interface CompanyListItemProps {
  company: CompaniesTypeDb["Row"];
  isSelected: boolean;
  onSelect: () => void;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isDisabled?: boolean;
}

export function CompanyListItem({
  company,
  isSelected,
  onSelect,
  onView,
  onEdit,
  onDelete,
  isDisabled = false,
}: CompanyListItemProps) {
  const tCommon = useTranslations("Common.Buttons");
  const tCompanies = useTranslations("Companies");

  const handleClick = () => {
    onSelect();
    onView();
  };

  return (
    <li
      className={cn(
        "flex items-center justify-between p-3 transition-colors",
        isSelected && "bg-muted",
        "hover:bg-muted/50"
      )}
    >
      {/* Clickable area - entire item content */}
      <button
        type="button"
        onClick={handleClick}
        disabled={isDisabled}
        className="grow text-left min-w-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
      >
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
          <p className="font-medium text-sm truncate" title={company.name}>
            {company.name}
          </p>
          {company.is_partner && (
            <Badge variant="outline" className="shrink-0">
              {tCompanies("partner")}
            </Badge>
          )}
          {Number(company.discount_percentage) > 0 && (
            <Badge variant="outline" className="shrink-0 gap-1">
              <Percent className="h-3 w-3" />
              {company.discount_percentage} {tCompanies("discount")}
            </Badge>
          )}
        </div>
        {company.tin && (
          <p className="text-xs text-muted-foreground mt-0.5 ml-6">
            {tCompanies("tin")}: {company.tin}
          </p>
        )}
      </button>

      {/* Actions Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            disabled={isDisabled}
            className="shrink-0"
            aria-label="More options"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onView}>
            <Eye className="mr-2 h-4 w-4" />
            <span>{tCommon("viewButton")}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onEdit}>
            <PencilIcon className="mr-2 h-4 w-4" />
            <span>{tCommon("editButton")}</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onDelete} variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            <span>{tCommon("deleteButton")}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
}

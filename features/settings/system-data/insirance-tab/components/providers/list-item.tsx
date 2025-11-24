"use client";

import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { InsuranceProviderAdminModel } from "@/types/data-models";
import { cn } from "@/utils/functions/utils";

interface ProviderListItemProps {
  provider: InsuranceProviderAdminModel;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function ProviderListItem({
  provider,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: ProviderListItemProps) {
  const locale = useLocale();
  const defaultLocale = "en";

  const providerName =
    provider.name_translations?.[locale] ??
    provider.name_translations?.[defaultLocale] ??
    "Unnamed Provider";

  return (
    <li
      className={cn(
        "flex items-center justify-between p-3 transition-colors",
        isSelected && "bg-muted",
        "hover:bg-muted/50"
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex-grow text-left min-w-0"
      >
        <p className="font-medium text-sm truncate" title={providerName}>
          {providerName}
        </p>
      </button>
      <div className="flex gap-2 pl-4">
        <Button variant="outline" size="sm" onClick={onEdit}>
          Edit
        </Button>
        <Button variant="destructive" size="sm" onClick={onDelete}>
          Delete
        </Button>
      </div>
    </li>
  );
}

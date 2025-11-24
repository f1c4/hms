"use client";

import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { InsurancePlanAdminModel } from "@/types/data-models";

interface PlanListItemProps {
  plan: InsurancePlanAdminModel;
  onEdit: () => void;
  onDelete: () => void;
}

export function PlanListItem({ plan, onEdit, onDelete }: PlanListItemProps) {
  const locale = useLocale();
  const defaultLocale = "en";

  const planName =
    plan.name_translations?.[locale] ??
    plan.name_translations?.[defaultLocale] ??
    "Unnamed Plan";
  const planDescription =
    plan.description_translations?.[locale] ??
    plan.description_translations?.[defaultLocale];

  return (
    <li className="flex items-center justify-between p-3">
      <div className="flex-grow text-left min-w-0">
        <p className="font-medium text-sm truncate" title={planName}>
          {planName}
        </p>
        {planDescription && (
          <p
            className="text-xs text-muted-foreground truncate"
            title={planDescription}
          >
            {planDescription}
          </p>
        )}
      </div>
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

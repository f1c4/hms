"use client";

import { InsurancePlanAdminModel } from "@/types/data-models";
import { PlanListItem } from "./list-item";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PlanListProps {
  plans: InsurancePlanAdminModel[];
  onEdit: (plan: InsurancePlanAdminModel) => void;
  onDelete: (plan: InsurancePlanAdminModel) => void;
}

export function PlanList({ plans, onEdit, onDelete }: PlanListProps) {
  return (
    <div className="space-y-4">
      {plans.length > 0 ? (
        <div className="rounded-md border">
          <ul className="divide-y">
            {plans.map((plan) => (
              <PlanListItem
                key={plan.id}
                plan={plan}
                onEdit={() => onEdit(plan)}
                onDelete={() => onDelete(plan)}
              />
            ))}
          </ul>
        </div>
      ) : (
        <Alert>
          <AlertDescription>
            No plans found for this provider. Click ADD PLAN to create one.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

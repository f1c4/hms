"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InsuranceProviderAdminModel,
  InsurancePlanAdminModel,
} from "@/types/data-models";
import { PlanList } from "./list";
import { PlanForm } from "./form";
import { ConfirmDialog } from "@/features/patients/shared/components/confirm-dialog";
import { usePlanMutations } from "../../hooks/use-plans";
import { DisabledSectionPlaceholder } from "@/features/patients/shared/components/disable-placeholder";
import { Button } from "@/components/ui/button";

interface InsurancePlansSectionProps {
  provider?: InsuranceProviderAdminModel;
}

export default function InsurancePlansSection({
  provider,
}: InsurancePlansSectionProps) {
  const [mode, setMode] = useState<"view" | "create" | "edit">("view");
  const [itemToEdit, setItemToEdit] = useState<InsurancePlanAdminModel | null>(
    null
  );
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const locale = useLocale();
  const defaultLocale = "en";
  const { deletePlan } = usePlanMutations();

  const providerName =
    provider?.name_translations?.[locale] ??
    provider?.name_translations?.[defaultLocale] ??
    "No Provider Selected";
  const plans = provider?.plans ?? [];
  const isProviderSelected = !!provider;

  const handleAdd = () => {
    setItemToEdit(null);
    setMode("create");
  };

  const handleEdit = (plan: InsurancePlanAdminModel) => {
    setItemToEdit(plan);
    setMode("edit");
  };

  const handleDeleteRequest = (plan: InsurancePlanAdminModel) => {
    setItemToEdit(plan);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!itemToEdit) return;
    deletePlan.mutate(itemToEdit.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setItemToEdit(null);
        setMode("view"); // Ensure we go back to view mode
      },
    });
  };

  const handleCloseForm = () => {
    setItemToEdit(null);
    setMode("view");
  };

  const isFormOpen = mode === "create" || mode === "edit";

  const dialogPlanName =
    itemToEdit?.name_translations?.[locale] ??
    itemToEdit?.name_translations?.[defaultLocale] ??
    "this plan";

  return (
    <Card className="relative">
      {!isProviderSelected && (
        <DisabledSectionPlaceholder
          title="No Provider Selected"
          message="Please select a provider from the list to manage its plans."
        />
      )}
      <CardHeader>
        <CardTitle>Plans for: {providerName}</CardTitle>
        <CardAction>
          <Button onClick={handleAdd} disabled={!isProviderSelected}>
            Add Plan
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isFormOpen ? (
          <PlanForm
            providerId={provider!.id}
            itemToEdit={itemToEdit}
            onClose={handleCloseForm}
          />
        ) : (
          <PlanList
            plans={plans}
            onEdit={handleEdit}
            onDelete={handleDeleteRequest}
          />
        )}
      </CardContent>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        isPending={deletePlan.isPending}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Delete Plan"
        description={`Are you sure you want to delete the plan "${dialogPlanName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </Card>
  );
}

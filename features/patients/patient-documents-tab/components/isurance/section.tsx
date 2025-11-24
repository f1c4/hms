"use client";

import { useState } from "react";
import { useMainStore } from "@/store/main-store";
import { useShallow } from "zustand/react/shallow";
import { useLocale, useTranslations } from "next-intl";

import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InsuranceList } from "./list";
import { InsuranceForm } from "./form";
import { ConfirmDialog } from "@/features/patients/shared/components/confirm-dialog";
import { PatientInsuranceClientModel } from "@/types/client-models";
import { useInsuranceMutations } from "../../hooks/insurances/use-insurance-mutation";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

export function InsurancesSection() {
  const locale = useLocale();
  const [selectedItem, setSelectedItem] =
    useState<PatientInsuranceClientModel | null>(null);
  const t = useTranslations("Patient.GeneralInsuranceNotifications");
  const tSection = useTranslations("Patient.GeneralInsurance");
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { deleteInsurance } = useInsuranceMutations();

  const { pristineData, sectionState, setSectionState } = useMainStore(
    useShallow((state) => ({
      pristineData: state.patient.pristineData,
      sectionState: state.patient.uiState.documents.insurance,
      setSectionState: state.patient.actions.setSectionState,
    }))
  );

  const { mode } = sectionState;
  const insurances = pristineData?.insurances ?? [];
  const isCreating = mode === "create";
  const isEditing = mode === "edit";
  const showForm = isCreating || isEditing;
  const providerName =
    selectedItem?.plan.provider.name_translations?.[locale] ??
    tSection("thisPolicy");

  // Handlers now use startSectionTransition to wrap the state changes
  const handleAdd = () => {
    setSelectedItem(null);
    setSectionState("documents", "insurance", { mode: "create" });
  };

  const handleEdit = (item: PatientInsuranceClientModel) => {
    setSelectedItem(item);
    setSectionState("documents", "insurance", { mode: "edit" });
  };

  const handleCloseForm = () => {
    setSelectedItem(null);
    setSectionState("documents", "insurance", { mode: "view" });
  };

  const handleDeleteRequest = (item: PatientInsuranceClientModel) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedItem) return;
    deleteInsurance.mutate(selectedItem.id, {
      onSuccess: (result) => {
        if (!result.error) {
          setDeleteDialogOpen(false);
          setSelectedItem(null);
        }
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tSection("title")}</CardTitle>
        <CardAction>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAdd}
            disabled={showForm}
          >
            <PlusIcon className="h-4 w-4" />
            {tSection("addInsurance")}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-6">
        <InsuranceList
          insurances={insurances}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
          isFormOpen={showForm}
        />
      </CardContent>

      <Dialog
        open={showForm}
        onOpenChange={(isOpen) => {
          if (!isOpen) handleCloseForm();
        }}
      >
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? tSection("editTitle") : tSection("addTitle")}
            </DialogTitle>
            <DialogDescription />
          </DialogHeader>
          <InsuranceForm
            key={selectedItem?.id}
            itemToEdit={isEditing ? selectedItem : null}
            onClose={handleCloseForm}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        isPending={deleteInsurance.isPending}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title={t("deleteDialogTitle")}
        description={t("deleteDialogDescription", { providerName })}
        confirmText={t("deleteDialogConfirm")}
        cancelText={t("deleteDialogCancel")}
      />
    </Card>
  );
}

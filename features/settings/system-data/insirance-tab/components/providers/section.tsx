"use client";

import { useState, useEffect } from "react"; // Import useEffect
import { useLocale } from "next-intl";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InsuranceProviderAdminModel } from "@/types/data-models";
import { ProviderList } from "./list";
import { ProviderForm } from "./form";
import { ConfirmDialog } from "@/features/patients/shared/components/confirm-dialog";
import { useProviderMutations } from "../../hooks/use-providers";
import { Button } from "@/components/ui/button";

interface InsuranceProvidersSectionProps {
  providers: InsuranceProviderAdminModel[];
  selectedProviderId: number | null;
  onSelectProvider: (id: number | null) => void; // Allow null
}

export default function InsuranceProvidersSection({
  providers,
  selectedProviderId,
  onSelectProvider,
}: InsuranceProvidersSectionProps) {
  const [mode, setMode] = useState<"view" | "create" | "edit">("view");
  const [itemToEdit, setItemToEdit] =
    useState<InsuranceProviderAdminModel | null>(null);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const locale = useLocale();
  const defaultLocale = "en";
  const { deleteProvider } = useProviderMutations();

  // When the list of providers changes (e.g., after deletion),
  // check if the currently selected provider still exists.
  // If not, select the first available provider or null.
  useEffect(() => {
    if (
      selectedProviderId &&
      !providers.find((p) => p.id === selectedProviderId)
    ) {
      onSelectProvider(providers[0]?.id ?? null);
    }
  }, [providers, selectedProviderId, onSelectProvider]);

  const handleAdd = () => {
    setItemToEdit(null);
    setMode("create");
  };

  const handleEdit = (provider: InsuranceProviderAdminModel) => {
    setItemToEdit(provider);
    setMode("edit");
  };

  const handleDeleteRequest = (provider: InsuranceProviderAdminModel) => {
    setItemToEdit(provider);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!itemToEdit) return;
    deleteProvider.mutate(itemToEdit.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setItemToEdit(null);
        setMode("view");
      },
    });
  };

  const handleCloseForm = () => {
    setItemToEdit(null);
    setMode("view");
  };

  const isFormOpen = mode === "create" || mode === "edit";

  const dialogProviderName =
    itemToEdit?.name_translations?.[locale] ??
    itemToEdit?.name_translations?.[defaultLocale] ??
    "this provider";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Insurance Providers</CardTitle>
        <CardAction>
          <Button onClick={handleAdd} disabled={isFormOpen}>
            Add Provider
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isFormOpen ? (
          <ProviderForm itemToEdit={itemToEdit} onClose={handleCloseForm} />
        ) : (
          <ProviderList
            providers={providers}
            selectedProviderId={selectedProviderId}
            onSelectProvider={onSelectProvider} // Pass the handler directly
            onEdit={handleEdit}
            onDelete={handleDeleteRequest}
          />
        )}
      </CardContent>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        isPending={deleteProvider.isPending}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Delete Provider"
        description={`Are you sure you want to delete "${dialogProviderName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </Card>
  );
}

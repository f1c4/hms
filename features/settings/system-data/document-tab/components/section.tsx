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
import { Button } from "@/components/ui/button";
import { MedicalDocumentTypeModel } from "@/types/data-models";
import { DocTypeList } from "./list";
import { DocTypeForm } from "./form";
import { ConfirmDialog } from "@/features/patients/shared/components/confirm-dialog";
import { useDocTypeMutations } from "../hooks/use-doc-type";

interface DocTypeSectionProps {
  docTypes: MedicalDocumentTypeModel[];
}

export function DocTypeSection({ docTypes }: DocTypeSectionProps) {
  const [mode, setMode] = useState<"view" | "create" | "edit">("view");
  const [itemToEdit, setItemToEdit] = useState<MedicalDocumentTypeModel | null>(
    null
  );
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const locale = useLocale();
  const defaultLocale = "en";
  const { deleteDocType } = useDocTypeMutations();

  const handleAdd = () => {
    setItemToEdit(null);
    setMode("create");
  };

  const handleEdit = (docType: MedicalDocumentTypeModel) => {
    setItemToEdit(docType);
    setMode("edit");
  };

  const handleDeleteRequest = (docType: MedicalDocumentTypeModel) => {
    setItemToEdit(docType);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!itemToEdit) return;
    deleteDocType.mutate(itemToEdit.id, {
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

  const dialogDocTypeName =
    itemToEdit?.name_translations?.[locale] ??
    itemToEdit?.name_translations?.[defaultLocale] ??
    "this type";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Medical Document Types</CardTitle>
        <CardAction>
          <Button onClick={handleAdd} disabled={isFormOpen}>
            Add Document Type
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isFormOpen ? (
          <DocTypeForm itemToEdit={itemToEdit} onClose={handleCloseForm} />
        ) : (
          <DocTypeList
            docTypes={docTypes}
            onEdit={handleEdit}
            onDelete={handleDeleteRequest}
          />
        )}
      </CardContent>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        isPending={deleteDocType.isPending}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Delete Document Type"
        description={`Are you sure you want to delete "${dialogDocTypeName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </Card>
  );
}

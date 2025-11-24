"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MedicalHistoryDocumentClientModel } from "@/types/client-models";
import { PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { useDocumentMutations } from "../../hooks/docs/use-doc-mutation";
import { DocumentListItem } from "./document-list-item";

interface DocumentListProps {
  documents: MedicalHistoryDocumentClientModel[];
  eventId: number;
  onAdd: (eventId: number) => void;
  onEdit: (document: MedicalHistoryDocumentClientModel) => void;
}

export function DocumentList({
  documents,
  eventId,
  onAdd,
  onEdit,
}: DocumentListProps) {
  const t = useTranslations("Patient.MedicalHistory.Documents");

  const { deleteDocument, isProcessing } = useDocumentMutations();

  const [documentToDelete, setDocumentToDelete] = useState<number | null>(null);

  const handleDeleteClick = (docId: number) => {
    setDocumentToDelete(docId);
  };

  const handleCloseDialog = () => {
    setDocumentToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (documentToDelete) {
      deleteDocument.mutate(documentToDelete, {
        onSuccess: () => setDocumentToDelete(null),
      });
    }
  };

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">{t("title")}</h4>
        <Button size="sm" variant="outline" onClick={() => onAdd(eventId)}>
          <PlusIcon className="mr-2 h-4 w-4" />
          {t("addDocument")}
        </Button>
      </div>
      {documents.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("noDocuments")}</p>
      ) : (
        <ul className="space-y-2">
          {documents.map((doc) => (
            <DocumentListItem
              key={doc.id}
              doc={doc}
              onEdit={onEdit}
              handleDeleteClick={handleDeleteClick}
              isProcessing={isProcessing}
            />
          ))}
        </ul>
      )}
      <ConfirmationDialog
        isOpen={!!documentToDelete}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmDelete}
        title={t("deleteTitle", { item: t("document") })}
        description={t("deleteDescription")}
        isPending={deleteDocument.isPending}
      />
    </div>
  );
}

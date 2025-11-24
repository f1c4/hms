"use client";

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
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useMainStore } from "@/store/main-store";
import { useShallow } from "zustand/react/shallow";
import { IdentityDocumentList } from "./list";
import { DocumentForm } from "./form";
import { ConfirmDialog } from "@/features/patients/shared/components/confirm-dialog";
import { PatientIdDocumentClientModel } from "@/types/client-models";
import { useIdDocumentMutations } from "../../hooks/id-documents/use-doc-mutations";
import { PlusIcon } from "lucide-react";

export function IdentityDocumentsSection() {
  const tNotification = useTranslations(
    "Patient.GeneralIdDocumentNotifications"
  );
  const tSection = useTranslations("Patient.GeneralIdDocument");
  const tCommon = useTranslations("Common.Buttons");
  const { deleteDocument } = useIdDocumentMutations();
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] =
    useState<PatientIdDocumentClientModel | null>(null);

  const { pristineData, sectionState, setSectionState } = useMainStore(
    useShallow((state) => ({
      pristineData: state.patient.pristineData,
      sectionState: state.patient.uiState.documents.idDocs,
      setSectionState: state.patient.actions.setSectionState,
    }))
  );

  const { mode } = sectionState;
  const identityDocuments = pristineData?.id_documents ?? [];
  const isCreating = mode === "create";
  const isEditing = mode === "edit";
  const showForm = isCreating || isEditing;

  const handleAdd = () => {
    setSelectedDoc(null);
    setSectionState("documents", "idDocs", { mode: "create" });
  };

  const handleEdit = (doc: PatientIdDocumentClientModel) => {
    if (showForm) {
      setSelectedDoc(doc);
      setSectionState("documents", "idDocs", { mode: "edit" });
    } else {
      setSelectedDoc(doc);
      setSectionState("documents", "idDocs", { mode: "edit" });
    }
  };

  const handleDeleteRequest = (doc: PatientIdDocumentClientModel) => {
    setSelectedDoc(doc);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedDoc) return;
    deleteDocument.mutate(selectedDoc.id, {
      onSuccess: (result) => {
        if (!result.error) {
          setDeleteDialogOpen(false);
          setSelectedDoc(null);
        }
      },
    });
  };

  const handleCloseForm = () => {
    setSelectedDoc(null);
    setSectionState("documents", "idDocs", { mode: "view" });
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
            {tCommon("addButton")}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-6">
        <IdentityDocumentList
          documents={identityDocuments}
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
              {isEditing ? tSection("editDocument") : tSection("addDocument")}
            </DialogTitle>
            <DialogDescription />
          </DialogHeader>
          <DocumentForm
            key={selectedDoc?.id}
            documentToEdit={isEditing ? selectedDoc : null}
            onClose={handleCloseForm}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        isPending={deleteDocument.isPending}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title={tNotification("deleteDialogTitle")}
        description={tNotification("deleteDialogDescription")}
        confirmText={tNotification("deleteDialogConfirm")}
        cancelText={tNotification("deleteDialogCancel")}
      />
    </Card>
  );
}

"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CompaniesTypeDb } from "@/types/data-models";
import { CompanyList } from "./company-list";
import { CompanyForm } from "./company-form";
import { CompanyInfoDialog } from "./company-info-dialog";
import { ConfirmDialog } from "@/features/patients/shared/components/confirm-dialog";
import { useCompanyMutations } from "../hooks/use-companies";
import { AnimatedSwap } from "@/components/animate-swap";
import { PlusIcon, PencilIcon } from "lucide-react";

interface CompaniesSectionProps {
  companies: CompaniesTypeDb["Row"][];
}

export default function CompaniesSection({ companies }: CompaniesSectionProps) {
  const [mode, setMode] = useState<"view" | "create" | "edit">("view");
  const [itemToEdit, setItemToEdit] = useState<CompaniesTypeDb["Row"] | null>(
    null
  );
  const [itemToView, setItemToView] = useState<CompaniesTypeDb["Row"] | null>(
    null
  );
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(
    null
  );
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isInfoDialogOpen, setInfoDialogOpen] = useState(false);

  const tCommon = useTranslations("Common.Buttons");
  const tCompanies = useTranslations("Companies");
  const { deleteCompany } = useCompanyMutations();

  const isFormMode = mode === "create" || mode === "edit";

  const title = useMemo(() => {
    if (mode === "create") return tCompanies("createTitle") || "Create Company";
    if (mode === "edit") return tCompanies("editTitle") || "Edit Company";
    return tCompanies("title") || "Companies";
  }, [mode, tCompanies]);

  const handleAdd = () => {
    setItemToEdit(null);
    setMode("create");
  };

  const handleView = (company: CompaniesTypeDb["Row"]) => {
    setItemToView(company);
    setInfoDialogOpen(true);
  };

  const handleEdit = (company: CompaniesTypeDb["Row"]) => {
    setItemToEdit(company);
    setMode("edit");
  };

  const handleEditFromDialog = () => {
    if (itemToView) {
      setItemToEdit(itemToView);
      setMode("edit");
    }
  };

  const handleDeleteRequest = (company: CompaniesTypeDb["Row"]) => {
    setItemToEdit(company);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!itemToEdit) return;
    deleteCompany.mutate(itemToEdit.id, {
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

  return (
    <>
      <AnimatedSwap activeKey={isFormMode ? "company-form" : "company-list"}>
        {isFormMode ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PencilIcon className="h-5 w-5" />
                {title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CompanyForm itemToEdit={itemToEdit} onClose={handleCloseForm} />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              <CardAction>
                <Button onClick={handleAdd}>
                  <PlusIcon className="h-4 w-4" />
                  {tCommon("addButton")}
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <CompanyList
                companies={companies}
                selectedCompanyId={selectedCompanyId}
                onSelectCompany={setSelectedCompanyId}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDeleteRequest}
              />
            </CardContent>
          </Card>
        )}
      </AnimatedSwap>

      {/* Company Info Dialog */}
      <CompanyInfoDialog
        company={itemToView}
        isOpen={isInfoDialogOpen}
        onOpenChange={setInfoDialogOpen}
        onEdit={handleEditFromDialog}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        isPending={deleteCompany.isPending}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title={tCompanies("Notification.deleteModalTitle") || "Delete Company"}
        description={tCompanies("Notification.deleteModalDescription")}
        confirmText={tCommon("deleteButton")}
        cancelText={tCommon("cancelButton")}
      />
    </>
  );
}

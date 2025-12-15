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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CompaniesTypeDb } from "@/types/data-models";
import { CompanyList } from "./company-list";
import { CompanyForm } from "./company-form";
import { CompanyInfoDialog } from "./company-info-dialog";
import { ConfirmDialog } from "@/features/patients/shared/components/confirm-dialog";
import { useCompanyMutations } from "../hooks/use-companies";
import { AnimatedSwap } from "@/components/animate-swap";
import { PlusIcon, PencilIcon, Search, X } from "lucide-react";

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

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlyPartners, setShowOnlyPartners] = useState(false);

  const tCommon = useTranslations("Common.Buttons");
  const tCompanies = useTranslations("Companies");
  const { deleteCompany } = useCompanyMutations();

  const isFormMode = mode === "create" || mode === "edit";

  // Filter companies based on search and partner filter
  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      // Filter by partner status
      if (showOnlyPartners && !company.is_partner) {
        return false;
      }

      // Filter by search query (case-insensitive)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = company.name.toLowerCase().includes(query);
        const matchesTin = company.tin?.toLowerCase().includes(query);
        const matchesVat = company.vat?.toLowerCase().includes(query);

        if (!matchesName && !matchesTin && !matchesVat) {
          return false;
        }
      }

      return true;
    });
  }, [companies, searchQuery, showOnlyPartners]);

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

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  return (
    <>
      <AnimatedSwap
        activeKey={isFormMode ? "company-form" : "company-list"}
        className="flex flex-1 flex-col"
      >
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
          <Card className="flex flex-1 flex-col">
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              <CardAction>
                <Button onClick={handleAdd}>
                  <PlusIcon className="h-4 w-4" />
                  {tCommon("addButton")}
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="space-y-4 flex flex-1 flex-col">
              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={tCompanies("searchPlaceholder")}
                    className="pl-9 pr-9"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                      onClick={handleClearSearch}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Partner Filter */}
                <div className="flex items-center gap-2 shrink-0">
                  <Switch
                    id="partner-filter"
                    checked={showOnlyPartners}
                    onCheckedChange={setShowOnlyPartners}
                  />
                  <Label
                    htmlFor="partner-filter"
                    className="text-sm cursor-pointer"
                  >
                    {tCompanies("showOnlyPartners")}
                  </Label>
                </div>
              </div>

              {/* Results count */}
              {(searchQuery || showOnlyPartners) && (
                <p className="text-sm text-muted-foreground">
                  {tCompanies("resultsCount", {
                    count: filteredCompanies.length,
                  })}
                </p>
              )}

              {/* Company List */}
              <CompanyList
                companies={filteredCompanies}
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

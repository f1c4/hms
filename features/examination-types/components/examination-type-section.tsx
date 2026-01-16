"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
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
import { AnimatedSwap } from "@/components/animate-swap";
import { ConfirmDialog } from "@/features/patients/shared/components/confirm-dialog";
import { PlusIcon, PencilIcon, Search, X } from "lucide-react";

import { ExaminationTypeList } from "./examination-type-list";
import { ExaminationTypeForm } from "./examination-type-form";
import { useExaminationTypeMutations } from "../hooks/use-examination-types";
import type { ExaminationTypeModel } from "../types";
import {
  DialogHeader,
  DialogTitle,
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { ExaminationTypeDetails } from "./examination-type-details";

interface ExaminationTypesSectionProps {
  examinationTypes: ExaminationTypeModel[];
}

export default function ExaminationTypesSection({
  examinationTypes,
}: ExaminationTypesSectionProps) {
  const locale = useLocale();
  const t = useTranslations("Examinations");
  const tCommon = useTranslations("Common.Buttons");

  const [mode, setMode] = useState<"view" | "create" | "edit">("view");
  const [itemToEdit, setItemToEdit] = useState<ExaminationTypeModel | null>(
    null
  );
  const [itemToView, setItemToView] = useState<ExaminationTypeModel | null>(
    null
  );
  const [itemToToggle, setItemToToggle] = useState<ExaminationTypeModel | null>(
    null
  );
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isToggleDialogOpen, setToggleDialogOpen] = useState(false);

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [showInactive, setShowInactive] = useState(true);

  const { deactivateExaminationType, reactivateExaminationType } =
    useExaminationTypeMutations();

  const isFormMode = mode === "create" || mode === "edit";

  // Filter examination types based on search and active filter
  const filteredItems = useMemo(() => {
    return examinationTypes.filter((item) => {
      // Filter by active status
      if (!showInactive && !item.is_active) {
        return false;
      }

      // Filter by search query (case-insensitive)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const name =
          item.name_translations[locale] ||
          item.name_translations["en"] ||
          Object.values(item.name_translations)[0] ||
          "";
        const matchesName = name.toLowerCase().includes(query);

        // Updated category search
        const categoryName = item.category
          ? item.category.name_translations[locale] ||
            item.category.name_translations["en"] ||
            Object.values(item.category.name_translations)[0] ||
            ""
          : "";
        const matchesCategory = categoryName.toLowerCase().includes(query);

        const matchesKey = item.type_key.toLowerCase().includes(query);

        if (!matchesName && !matchesCategory && !matchesKey) {
          return false;
        }
      }

      return true;
    });
  }, [examinationTypes, searchQuery, showInactive, locale]);

  const title = useMemo(() => {
    if (mode === "create") return t("createTitle");
    if (mode === "edit") return t("editTitle");
    return t("title");
  }, [mode, t]);

  const handleAdd = () => {
    setItemToEdit(null);
    setMode("create");
  };

  const handleView = (item: ExaminationTypeModel) => {
    setItemToView(item);
    setIsViewModalOpen(true);
  };

  const handleEditFromView = () => {
    if (!itemToView) return;
    setIsViewModalOpen(false);
    setItemToEdit(itemToView);
    setMode("edit");
  };

  const handleEdit = (item: ExaminationTypeModel) => {
    setItemToEdit(item);
    setMode("edit");
  };

  const handleToggleActiveRequest = (item: ExaminationTypeModel) => {
    setItemToToggle(item);
    setToggleDialogOpen(true);
  };

  const handleConfirmToggle = () => {
    if (!itemToToggle) return;

    const mutation = itemToToggle.is_active
      ? deactivateExaminationType
      : reactivateExaminationType;

    mutation.mutate(itemToToggle.id, {
      onSuccess: () => {
        setToggleDialogOpen(false);
        setItemToToggle(null);
      },
    });
  };

  const handleCloseForm = () => {
    setItemToEdit(null);
    setMode("view");
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setItemToView(null);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const isPending =
    deactivateExaminationType.isPending || reactivateExaminationType.isPending;

  return (
    <>
      <AnimatedSwap
        activeKey={isFormMode ? "exam-type-form" : "exam-type-list"}
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
              <ExaminationTypeForm
                itemToEdit={itemToEdit}
                onClose={handleCloseForm}
              />
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
                    placeholder={t("searchPlaceholder")}
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

                {/* Show Inactive Filter */}
                <div className="flex items-center gap-2 shrink-0">
                  <Switch
                    id="inactive-filter"
                    checked={showInactive}
                    onCheckedChange={setShowInactive}
                  />
                  <Label
                    htmlFor="inactive-filter"
                    className="text-sm cursor-pointer"
                  >
                    {t("showInactive")}
                  </Label>
                </div>
              </div>

              {/* Results count */}
              {(searchQuery || !showInactive) && (
                <p className="text-sm text-muted-foreground">
                  {t("resultsCount", { count: filteredItems.length })}
                </p>
              )}

              {/* Examination Type List */}
              <ExaminationTypeList
                examinationTypes={filteredItems}
                onView={handleView}
                onEdit={handleEdit}
                onToggleActive={handleToggleActiveRequest}
              />
            </CardContent>
          </Card>
        )}
      </AnimatedSwap>

      {/* View Details Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("detailsTitle")}</DialogTitle>
          </DialogHeader>
          {itemToView && (
            <ExaminationTypeDetails
              item={itemToView}
              onEdit={handleEditFromView}
              onClose={handleCloseViewModal}
              canEdit={true} // TODO: Replace with actual authorization check
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Deactivate/Reactivate Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isToggleDialogOpen}
        isPending={isPending}
        onOpenChange={setToggleDialogOpen}
        onConfirm={handleConfirmToggle}
        title={
          itemToToggle?.is_active
            ? t("Notification.deactivateModalTitle")
            : t("reactivate")
        }
        description={
          itemToToggle?.is_active
            ? t("Notification.deactivateModalDescription")
            : undefined
        }
        confirmText={
          itemToToggle?.is_active ? t("deactivate") : t("reactivate")
        }
        cancelText={tCommon("cancelButton")}
      />
    </>
  );
}

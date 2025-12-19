"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CompanyInfoTypeDb } from "@/types/data-models";
import { CompanyInfoView } from "./company-info-view";
import { CompanyInfoForm } from "./company-info-form";
import { AnimatedSwap } from "@/components/animate-swap";
import { Building2, PencilIcon } from "lucide-react";

interface CompanyInfoSectionProps {
  companyInfo: CompanyInfoTypeDb["Row"] | null;
}

export default function CompanyInfoSection({
  companyInfo,
}: CompanyInfoSectionProps) {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const t = useTranslations("CompanyInfo");

  const isEditMode = mode === "edit";

  const title = useMemo(() => {
    if (mode === "edit") return t("editTitle");
    return t("title");
  }, [mode, t]);

  const handleEdit = () => {
    setMode("edit");
  };

  const handleCloseForm = () => {
    setMode("view");
  };

  // If no data exists yet, show empty state or form
  const hasData = companyInfo !== null;

  return (
    <AnimatedSwap
      activeKey={isEditMode ? "company-info-form" : "company-info-view"}
      className="flex flex-1 flex-col"
    >
      {isEditMode ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PencilIcon className="h-5 w-5" />
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CompanyInfoForm
              companyInfo={companyInfo}
              onClose={handleCloseForm}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasData ? (
              <CompanyInfoView companyInfo={companyInfo} onEdit={handleEdit} />
            ) : (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  {t("noDataMessage")}
                </p>
                <button
                  onClick={handleEdit}
                  className="text-primary hover:underline"
                >
                  {t("addCompanyInfo")}
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </AnimatedSwap>
  );
}

"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { InsuranceListItem } from "./list-item";
import { PatientInsuranceClientModel } from "@/types/client-models";
import { getInsuranceSignedViewUrl } from "../../actions/actions-insurance";

interface InsuranceListProps {
  insurances: PatientInsuranceClientModel[];
  onEdit: (item: PatientInsuranceClientModel) => void;
  onDelete: (item: PatientInsuranceClientModel) => void;
  isFormOpen?: boolean;
}

export function InsuranceList({
  insurances,
  onEdit,
  onDelete,
  isFormOpen,
}: InsuranceListProps) {
  const t = useTranslations("Patient");
  const [loadingFileId, setLoadingFileId] = useState<number | null>(null);

  const openFileMutation = useMutation({
    mutationFn: (filePath: string) => getInsuranceSignedViewUrl(filePath),
    onSuccess: (data) => {
      if (data?.signedUrl) {
        window.open(data.signedUrl, "_blank");
      }
    },
    onError: (error) => {
      toast.error(t("fileOpenError"));
      console.error(error);
    },
    onSettled: () => {
      setLoadingFileId(null);
    },
  });

  const handleOpenFile = (item: PatientInsuranceClientModel) => {
    if (!item.file_path || openFileMutation.isPending) return;
    setLoadingFileId(item.id);
    openFileMutation.mutate(item.file_path);
  };

  return (
    <>
      {insurances.length > 0 ? (
        <div className="rounded-md border">
          <ul className="divide-y">
            {insurances.map((item) => (
              <InsuranceListItem
                key={item.id}
                item={item}
                isLoading={loadingFileId === item.id}
                onEdit={onEdit}
                onDelete={onDelete}
                onOpenFile={handleOpenFile}
                isDisabled={isFormOpen}
              />
            ))}
          </ul>
        </div>
      ) : (
        <Alert variant="default">
          <AlertDescription className="px-3 py-2 text-sm">
            {t("GeneralInsuranceNotifications.noPoliciesFound")}
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}

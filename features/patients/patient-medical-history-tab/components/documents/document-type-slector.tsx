"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getMedicalDocumentTypes } from "../../actions/docs-actions";
import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface DocumentTypeSelectProps {
  value?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function DocumentTypeSelect({
  value,
  onChange,
  disabled,
}: DocumentTypeSelectProps) {
  const t = useTranslations("Patient.MedicalHistory.Documents.Form");
  const locale = useLocale();

  const {
    data: docTypes,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["medicalDocumentTypes"],
    queryFn: () => getMedicalDocumentTypes(),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });

  return (
    <Select
      disabled={disabled || !docTypes || docTypes.length === 0}
      onValueChange={(val) => onChange(parseInt(val, 10))}
      value={value ? String(value) : ""}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={t("docTypePlaceholder")} />
      </SelectTrigger>
      <SelectContent>
        {isLoading && (
          <div className="p-2">
            <Skeleton className="h-6 w-full" />
          </div>
        )}
        {isError && (
          <div className="p-2 text-sm text-red-600">
            {t("errorLoadingDocTypes")}
          </div>
        )}
        {docTypes?.map((type) => (
          <SelectItem key={type.id} value={String(type.id)}>
            {(type.name_translations as Record<string, string>)?.[locale] ??
              `Type ${type.id}`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

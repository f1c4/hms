"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  Euro,
  Stethoscope,
  CheckCircle2,
  XCircle,
  FileText,
  Calendar,
  Palette,
  PencilIcon,
} from "lucide-react";
import type { ExaminationTypeModel } from "../types";

interface ExaminationTypeDetailsProps {
  item: ExaminationTypeModel;
  onEdit: () => void;
  onClose: () => void;
  canEdit?: boolean; // For future authorization
}

export function ExaminationTypeDetails({
  item,
  onEdit,
  onClose,
  canEdit = true, // Default to true for now
}: ExaminationTypeDetailsProps) {
  const locale = useLocale();
  const t = useTranslations("Examinations");
  const tCommon = useTranslations("Common.Buttons");

  // Get localized values
  const name =
    item.name_translations[locale] ||
    item.name_translations["en"] ||
    Object.values(item.name_translations)[0] ||
    "";

  const description =
    item.description_translations?.[locale] ||
    item.description_translations?.["en"] ||
    Object.values(item.description_translations || {})[0] ||
    null;

  const preparationInstructions =
    item.preparation_instructions_translations?.[locale] ||
    item.preparation_instructions_translations?.["en"] ||
    Object.values(item.preparation_instructions_translations || {})[0] ||
    null;

  const categoryName = item.category
    ? item.category.name_translations[locale] ||
      item.category.name_translations["en"] ||
      Object.values(item.category.name_translations)[0] ||
      ""
    : null;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {item.color && (
            <span
              className="h-4 w-4 rounded-full shrink-0"
              style={{ backgroundColor: item.color }}
            />
          )}
          <div>
            <h3 className="text-lg font-semibold">{name}</h3>
            <p className="text-sm text-muted-foreground font-mono">
              {item.type_key}
            </p>
          </div>
        </div>
        <Badge variant={item.is_active ? "default" : "secondary"}>
          {item.is_active ? t("active") : t("inactive")}
        </Badge>
      </div>

      <Separator />

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{t("duration")}</span>
          </div>
          <p className="font-medium">
            {item.duration_minutes} {t("minutes")}
          </p>
        </div>

        {item.base_price != null && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Euro className="h-4 w-4" />
              <span>{t("price")}</span>
            </div>
            <p className="font-medium">{item.base_price.toFixed(2)}</p>
          </div>
        )}

        {categoryName && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Stethoscope className="h-4 w-4" />
              <span>{t("category")}</span>
            </div>
            <Badge variant="outline">{categoryName}</Badge>
          </div>
        )}

        {item.color && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Palette className="h-4 w-4" />
              <span>{t("color")}</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="h-5 w-5 rounded border"
                style={{ backgroundColor: item.color }}
              />
              <span className="font-mono text-sm">{item.color}</span>
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      {description && (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>{t("description")}</span>
          </div>
          <p className="text-sm whitespace-pre-wrap">{description}</p>
        </div>
      )}

      {/* Preparation Instructions */}
      {preparationInstructions && (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{t("preparationInstructions")}</span>
          </div>
          <p className="text-sm whitespace-pre-wrap">
            {preparationInstructions}
          </p>
        </div>
      )}

      <Separator />

      {/* Requirements Flags */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          {t("requirements")}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-center gap-2">
            {item.requires_referral ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-sm">{t("requiresReferral")}</span>
          </div>
          <div className="flex items-center gap-2">
            {item.requires_fasting ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-sm">{t("requiresFasting")}</span>
          </div>
          <div className="flex items-center gap-2">
            {item.requires_appointment ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-sm">{t("requiresAppointment")}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onClose}>
          {tCommon("closeButton")}
        </Button>
        {canEdit && (
          <Button onClick={onEdit}>
            <PencilIcon className="mr-2 h-4 w-4" />
            {tCommon("editButton")}
          </Button>
        )}
      </div>
    </div>
  );
}

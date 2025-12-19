"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CompanyInfoTypeDb } from "@/types/data-models";
import { useCountryOptions } from "@/features/patients/shared/hooks/use-country-options";
import { useCityOptions } from "@/features/patients/shared/hooks/use-city-options";
import {
  Building2,
  Phone,
  Mail,
  Globe,
  MapPin,
  Flag,
  FileText,
  CreditCard,
  PencilIcon,
} from "lucide-react";

interface CompanyInfoViewProps {
  companyInfo: CompanyInfoTypeDb["Row"];
  onEdit: () => void;
}

export function CompanyInfoView({ companyInfo, onEdit }: CompanyInfoViewProps) {
  const t = useTranslations("CompanyInfo");
  const tCommon = useTranslations("Common.Buttons");

  // Get country and city options for display
  const { countryOptions } = useCountryOptions();
  const { cityOptions } = useCityOptions(companyInfo.country_id);

  const countryName = countryOptions.find(
    (opt) => opt.value === companyInfo.country_id
  )?.label;

  const cityName = cityOptions.find(
    (opt) => opt.value === companyInfo.city_id
  )?.label;

  const hasLocationInfo =
    companyInfo.country_id || companyInfo.city_id || companyInfo.address;

  const hasBusinessIds =
    companyInfo.tin || companyInfo.vat || companyInfo.registration_number;

  const hasContactInfo =
    companyInfo.phone || companyInfo.email || companyInfo.website;

  return (
    <div className="space-y-6">
      {/* Header with name and edit button */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">
              {companyInfo.name || t("noNameSet")}
            </h2>
            {companyInfo.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {companyInfo.description}
              </p>
            )}
          </div>
        </div>
        <Button onClick={onEdit} variant="outline" size="sm">
          <PencilIcon className="h-4 w-4 mr-2" />
          {tCommon("editButton")}
        </Button>
      </div>

      {/* Business Identifiers */}
      {hasBusinessIds && (
        <>
          <Separator />
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              {t("businessIdentifiers")}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {companyInfo.tin && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">{t("tin")}</p>
                  <p className="font-medium">{companyInfo.tin}</p>
                </div>
              )}
              {companyInfo.vat && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">{t("vat")}</p>
                  <p className="font-medium">{companyInfo.vat}</p>
                </div>
              )}
              {companyInfo.registration_number && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    {t("registrationNumber")}
                  </p>
                  <p className="font-medium">
                    {companyInfo.registration_number}
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Location */}
      {hasLocationInfo && (
        <>
          <Separator />
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {t("location")}
            </h3>
            <div className="space-y-2 text-sm">
              {(countryName || cityName) && (
                <div className="flex items-center gap-2">
                  <Flag className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {[cityName, countryName].filter(Boolean).join(", ")}
                  </span>
                </div>
              )}
              {companyInfo.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span>{companyInfo.address}</span>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Contact Information */}
      {hasContactInfo && (
        <>
          <Separator />
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Phone className="h-4 w-4" />
              {t("contactInformation")}
            </h3>
            <div className="space-y-2 text-sm">
              {companyInfo.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`tel:${companyInfo.phone}`}
                    className="hover:underline"
                  >
                    {companyInfo.phone}
                  </a>
                </div>
              )}
              {companyInfo.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`mailto:${companyInfo.email}`}
                    className="hover:underline"
                  >
                    {companyInfo.email}
                  </a>
                </div>
              )}
              {companyInfo.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={companyInfo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-primary"
                  >
                    {companyInfo.website}
                  </a>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Info note */}
      <Separator />
      <p className="text-xs text-muted-foreground flex items-center gap-2">
        <FileText className="h-4 w-4" />
        {t("info")}
      </p>
    </div>
  );
}

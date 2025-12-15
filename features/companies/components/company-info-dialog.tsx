"use client";

import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CompaniesTypeDb } from "@/types/data-models";
import { useCompanyTypes } from "../hooks/use-company-types";
import { useCountryOptions } from "@/features/patients/shared/hooks/use-country-options";
import { useCityOptions } from "@/features/patients/shared/hooks/use-city-options";
import {
  Building2,
  Phone,
  Mail,
  Globe,
  MapPin,
  Percent,
  Handshake,
  Flag,
} from "lucide-react";

interface CompanyInfoDialogProps {
  company: CompaniesTypeDb["Row"] | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
}

export function CompanyInfoDialog({
  company,
  isOpen,
  onOpenChange,
  onEdit,
}: CompanyInfoDialogProps) {
  const tCompanies = useTranslations("Companies");
  const tCommon = useTranslations("Common.Buttons");
  const { getLabel: getTypeLabel } = useCompanyTypes();

  // Get country and city options
  const { countryOptions } = useCountryOptions();
  const { cityOptions } = useCityOptions(company?.country_id);

  if (!company) return null;

  // Look up country and city names
  const countryName = countryOptions.find(
    (opt) => opt.value === company.country_id
  )?.label;

  const cityName = cityOptions.find(
    (opt) => opt.value === company.city_id
  )?.label;

  const handleEdit = () => {
    onOpenChange(false);
    onEdit();
  };

  // Check if we have any location info to display
  const hasLocationInfo =
    company.country_id || company.city_id || company.address;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          {/* Company name and badges */}
          <DialogTitle className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 shrink-0" />
              <span>{company.name}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{getTypeLabel(company.type)}</Badge>
              {company.is_partner && (
                <Badge variant="secondary" className="gap-1">
                  <Handshake className="h-3 w-3" />
                  {tCompanies("partner")}
                </Badge>
              )}
              {Number(company.discount_percentage) > 0 && (
                <Badge variant="default" className="gap-1">
                  <Percent className="h-3 w-3" />
                  {company.discount_percentage} {tCompanies("discount")}
                </Badge>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Business Identifiers (TIN, VAT, Registration Number) */}
          {(company.tin || company.vat || company.registration_number) && (
            <>
              <Separator />
              <div className="flex flex-col gap-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  {tCompanies("businessIdentifiers")}
                </h4>
                <div className="flex gap-4 text-sm">
                  {company.tin && (
                    <div className="flex flex-col items-start gap-1">
                      <span className="text-muted-foreground">
                        {tCompanies("tin")}:
                      </span>
                      <span className="font-medium">{company.tin}</span>
                    </div>
                  )}
                  {company.vat && (
                    <div className="flex flex-col items-start gap-1">
                      <span className="text-muted-foreground">
                        {tCompanies("vat")}:
                      </span>
                      <span className="font-medium">{company.vat}</span>
                    </div>
                  )}
                  {company.registration_number && (
                    <div className="flex flex-col items-start gap-1">
                      <span className="text-muted-foreground">
                        {tCompanies("registrationNumber")}:
                      </span>
                      <span className="font-medium">
                        {company.registration_number}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Contact Information */}
          {(hasLocationInfo ||
            company.phone ||
            company.email ||
            company.website) && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  {tCompanies("contactInformation")}
                </h4>
                <div className="flex flex-col gap-2 text-sm">
                  {/* Country & City */}
                  {(countryName || cityName) && (
                    <div className="flex items-center gap-2">
                      <Flag className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span>
                        {[cityName, countryName].filter(Boolean).join(", ")}
                      </span>
                    </div>
                  )}
                  {/* Address */}
                  {company.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <span>{company.address}</span>
                    </div>
                  )}
                  {company.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                      <a
                        href={`tel:${company.phone}`}
                        className="hover:underline"
                      >
                        {company.phone}
                      </a>
                    </div>
                  )}
                  {company.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                      <a
                        href={`mailto:${company.email}`}
                        className="hover:underline"
                      >
                        {company.email}
                      </a>
                    </div>
                  )}
                  {company.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline text-primary"
                      >
                        {company.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {tCommon("closeButton")}
          </Button>
          <Button onClick={handleEdit}>{tCommon("editButton")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

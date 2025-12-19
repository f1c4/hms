"use client";

import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useCompanyInfo } from "./hooks/use-company-info";
import CompanyInfoSection from "./components/company-info-section";

export default function CompanyInfoTab() {
  const { data: companyInfo, isLoading, isError } = useCompanyInfo();

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load company info. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return <CompanyInfoSection companyInfo={companyInfo ?? null} />;
}

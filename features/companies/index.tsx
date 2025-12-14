"use client";

import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useCompanies } from "./hooks/use-companies";
import CompaniesSection from "./components/companies-section";

export default function CompaniesTab() {
  const { data: companies, isLoading, isError } = useCompanies();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load companies. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return <CompaniesSection companies={companies ?? []} />;
}

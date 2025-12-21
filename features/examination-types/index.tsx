"use client";

import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useExaminationTypes } from "./hooks/use-examination-types";
import ExaminationTypesSection from "./components/examination-type-section";

interface ExaminationTypesTabProps {
  includeInactive?: boolean;
}

export default function ExaminationTypesTab({
  includeInactive = true,
}: ExaminationTypesTabProps) {
  const { data, isLoading, isError } = useExaminationTypes(includeInactive);

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
          Failed to load examination types. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return <ExaminationTypesSection examinationTypes={data ?? []} />;
}

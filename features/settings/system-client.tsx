"use client";

import PageContainer from "@/components/layout/page-container";
import InsuranceTab from "./system-data/insirance-tab";
import DocumentTab from "./system-data/document-tab"; // Import the new component
import { Settings, Loader2 } from "lucide-react";
import { Heading } from "@/components/heading";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useQuery } from "@tanstack/react-query";
import { getFullSystemData } from "./shared/actions/get-full-system-data";

export default function SystemClient() {
  // Fetch data using useQuery. This will be hydrated on initial load.
  const {
    data: systemData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["full-system-data"],
    queryFn: getFullSystemData,
  });

  return (
    <PageContainer>
      <Heading
        title="System Data Management"
        description="Manage system-wide data for insurance, document types, and more."
        icon={<Settings className="h-8 w-8" />}
      />
      <Tabs defaultValue="insurances" className="w-full">
        <TabsList>
          <TabsTrigger value="insurances">Insurances</TabsTrigger>
          <TabsTrigger value="doc-types">Document Types</TabsTrigger>
        </TabsList>

        {/* Shared Loading/Error State */}
        {isLoading && (
          <div className="flex items-center justify-center p-8 mt-4">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
        {isError && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load system data. Please try again later.
            </AlertDescription>
          </Alert>
        )}

        {/* Render content only when data is available */}
        {systemData && (
          <>
            {/* Insurance Tab Content */}
            <TabsContent value="insurances" className="mt-4">
              <InsuranceTab initialInsuranceData={systemData.insurance_data} />
            </TabsContent>

            {/* Document Types Tab Content */}
            <TabsContent value="doc-types" className="mt-4">
              <DocumentTab
                initialDocTypesData={systemData.medical_document_types}
              />
            </TabsContent>
          </>
        )}
      </Tabs>
    </PageContainer>
  );
}

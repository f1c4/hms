"use client";

import { useState, useEffect } from "react";
import InsuranceProvidersSection from "./components/providers/section";
import InsurancePlansSection from "./components/plans/section";
import { InsuranceProviderAdminModel } from "@/types/data-models";

interface InsuranceTabProps {
  initialInsuranceData: InsuranceProviderAdminModel[];
}

export default function InsuranceTab({
  initialInsuranceData,
}: InsuranceTabProps) {
  const [selectedProviderId, setSelectedProviderId] = useState<number | null>(
    null
  );

  // Effect to set the initial provider only once on mount
  useEffect(() => {
    if (initialInsuranceData.length > 0) {
      setSelectedProviderId(initialInsuranceData[0].id);
    }
  }, [initialInsuranceData]);

  const selectedProvider = initialInsuranceData.find(
    (p) => p.id === selectedProviderId
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
      <InsuranceProvidersSection
        providers={initialInsuranceData}
        selectedProviderId={selectedProviderId}
        onSelectProvider={setSelectedProviderId}
      />
      <InsurancePlansSection
        key={selectedProviderId}
        provider={selectedProvider}
      />
    </div>
  );
}

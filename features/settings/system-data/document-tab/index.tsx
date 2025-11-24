"use client";

import { MedicalDocumentTypeModel } from "@/types/data-models";
import { DocTypeSection } from "./components/section";

interface DocumentTabProps {
  initialDocTypesData: MedicalDocumentTypeModel[];
}

export default function DocumentTab({ initialDocTypesData }: DocumentTabProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <DocTypeSection docTypes={initialDocTypesData} />
    </div>
  );
}

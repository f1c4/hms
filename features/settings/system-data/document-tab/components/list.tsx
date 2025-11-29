"use client";

import { MedicalDocumentTypeModel } from "@/types/data-models";
import { DocTypeListItem } from "./list-item";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DocTypeListProps {
  docTypes: MedicalDocumentTypeModel[];
  onEdit: (docType: MedicalDocumentTypeModel) => void;
}

export function DocTypeList({ docTypes, onEdit }: DocTypeListProps) {
  return (
    <div className="space-y-4">
      {docTypes.length > 0 ? (
        <div className="rounded-md border">
          <ul className="divide-y">
            {docTypes.map((docType) => (
              <DocTypeListItem
                key={docType.id}
                docType={docType}
                onEdit={() => onEdit(docType)}
              />
            ))}
          </ul>
        </div>
      ) : (
        <Alert>
          <AlertDescription>
            No document types found. Click Add Document Type to create one.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

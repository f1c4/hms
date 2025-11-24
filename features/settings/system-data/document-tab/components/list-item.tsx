"use client";

import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { MedicalDocumentTypeModel } from "@/types/data-models";

interface DocTypeListItemProps {
  docType: MedicalDocumentTypeModel;
  onEdit: () => void;
  onDelete: () => void;
}

export function DocTypeListItem({
  docType,
  onEdit,
  onDelete,
}: DocTypeListItemProps) {
  const locale = useLocale();
  const defaultLocale = "en";

  const docTypeName =
    docType.name_translations?.[locale] ??
    docType.name_translations?.[defaultLocale] ??
    "Unnamed Type";

  return (
    <li className="flex items-center justify-between p-3">
      <div className="flex-grow text-left min-w-0">
        <p className="font-medium text-sm truncate" title={docTypeName}>
          {docTypeName}
        </p>
        <p
          className="text-xs text-muted-foreground truncate"
          title={docType.type_key}
        >
          Key: {docType.type_key}
        </p>
      </div>
      <div className="flex gap-2 pl-4">
        <Button variant="outline" size="sm" onClick={onEdit}>
          Edit
        </Button>
        <Button variant="destructive" size="sm" onClick={onDelete}>
          Delete
        </Button>
      </div>
    </li>
  );
}

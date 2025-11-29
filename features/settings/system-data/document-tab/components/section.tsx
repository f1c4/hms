"use client";

import { useState } from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MedicalDocumentTypeModel } from "@/types/data-models";
import { DocTypeList } from "./list";
import { DocTypeForm } from "./form";

interface DocTypeSectionProps {
  docTypes: MedicalDocumentTypeModel[];
}

export function DocTypeSection({ docTypes }: DocTypeSectionProps) {
  const [mode, setMode] = useState<"view" | "create" | "edit">("view");
  const [itemToEdit, setItemToEdit] = useState<MedicalDocumentTypeModel | null>(
    null
  );

  const handleAdd = () => {
    setItemToEdit(null);
    setMode("create");
  };

  const handleEdit = (docType: MedicalDocumentTypeModel) => {
    setItemToEdit(docType);
    setMode("edit");
  };

  const handleCloseForm = () => {
    setItemToEdit(null);
    setMode("view");
  };

  const isFormOpen = mode === "create" || mode === "edit";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Medical Document Types</CardTitle>
        <CardAction>
          <Button onClick={handleAdd} disabled={isFormOpen}>
            Add Document Type
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isFormOpen ? (
          <DocTypeForm itemToEdit={itemToEdit} onClose={handleCloseForm} />
        ) : (
          <DocTypeList docTypes={docTypes} onEdit={handleEdit} />
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { IdentityDocumentListItem } from "./list-item";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PatientIdDocumentClientModel } from "@/types/client-models";
import { useMutation } from "@tanstack/react-query";
import { getSignedViewUrl } from "../../actions/actions-docs";
import { toast } from "sonner";

interface IdentityDocumentListProps {
  documents: PatientIdDocumentClientModel[];
  onEdit: (doc: PatientIdDocumentClientModel) => void;
  onDelete: (doc: PatientIdDocumentClientModel) => void;
  isFormOpen?: boolean;
}

export function IdentityDocumentList({
  documents,
  onEdit,
  onDelete,
  isFormOpen,
}: IdentityDocumentListProps) {
  const [loadingFileId, setLoadingFileId] = useState<number | null>(null);

  const openFileMutation = useMutation({
    mutationFn: (filePath: string) => getSignedViewUrl(filePath),
    onSuccess: (data) => {
      if (data?.signedUrl) {
        window.open(data.signedUrl, "_blank");
      }
    },
    onError: (error) => {
      toast.error("Could not open file.");
      console.error(error);
    },
    onSettled: () => {
      setLoadingFileId(null);
    },
  });

  const handleOpenFile = (doc: PatientIdDocumentClientModel) => {
    if (!doc.file_path || openFileMutation.isPending) return;
    setLoadingFileId(doc.id);
    openFileMutation.mutate(doc.file_path);
  };

  return (
    <>
      {documents.length > 0 ? (
        <div className="rounded-md border">
          <ul className="divide-y">
            {documents.map((doc) => (
              <IdentityDocumentListItem
                key={doc.id}
                doc={doc}
                isLoading={loadingFileId === doc.id}
                onEdit={onEdit}
                onDelete={onDelete}
                onOpenFile={handleOpenFile}
                isFormOpen={isFormOpen}
              />
            ))}
          </ul>
        </div>
      ) : (
        <Alert variant="default">
          <AlertDescription className="px-3 py-2 text-sm">
            No identity documents found.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}

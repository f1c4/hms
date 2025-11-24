import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MedicalHistoryDocumentClientModel } from "@/types/client-models";
import { FileText, MoreHorizontal, PencilIcon, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { getSignedViewUrl } from "../../actions/docs-actions";
import { toast } from "sonner";
import { useCallback, useState } from "react";

interface DocumentListItemProps {
  doc: MedicalHistoryDocumentClientModel;
  onEdit: (document: MedicalHistoryDocumentClientModel) => void;
  handleDeleteClick: (docId: number) => void;
  isProcessing: boolean;
}

export function DocumentListItem({
  doc,
  onEdit,
  handleDeleteClick,
  isProcessing,
}: DocumentListItemProps) {
  const tCommon = useTranslations("Common.Buttons");
  const tDocs = useTranslations("Patient.MedicalHistory.Documents");
  const locale = useLocale();
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);

  // Get the translated document type name, with a fallback
  const docTypeName =
    doc.document_type_translations?.[locale] ?? tDocs("unnamedType");

  // Format the date according to the current locale
  const formattedDate = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(doc.document_date);

  const noteText =
    doc.notes?.[locale] ??
    doc.notes?.["en"] ?? // pick your project fallback
    null;

  const handleOpen = useCallback(async () => {
    if (!doc.file_path) {
      toast.error(
        tDocs("Errors.noFileAttached", { default: "No file attached." })
      );
      return;
    }
    try {
      setIsLoadingUrl(true);
      const data = await getSignedViewUrl(doc.file_path);
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error("Open document error:", err);
      toast.error(
        tDocs("Errors.openFileFailed", { default: "Could not open file." })
      );
    } finally {
      setIsLoadingUrl(false);
    }
  }, [doc.file_path, tDocs]);

  return (
    <li
      key={doc.id}
      className="flex items-center justify-between rounded-md border bg-muted/50 p-2 pl-3 text-sm"
    >
      <div
        className="flex items-center gap-3 overflow-hidden cursor-pointer select-none rounded-sm hover:bg-muted/60 px-1 -mx-1"
        role="button"
        tabIndex={0}
        onClick={isProcessing || isLoadingUrl ? undefined : handleOpen}
        onKeyDown={(e) => {
          if (isProcessing || isLoadingUrl) return;
          if (e.key === "Enter" || e.key === " ") handleOpen();
        }}
      >
        <FileText className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
        <div className="flex flex-col gap-1 overflow-hidden">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate" title={docTypeName}>
              {docTypeName}
            </span>
            <div className="flex items-center gap-1">
              {doc.diagnoses.map((diagnosis) => (
                <Badge
                  key={diagnosis.diagnosis_code}
                  variant="secondary"
                  className="whitespace-nowrap"
                  title={
                    diagnosis.diagnosis_translations?.[locale] ??
                    diagnosis.diagnosis_code
                  }
                >
                  {diagnosis.diagnosis_code}
                </Badge>
              ))}
            </div>
          </div>
          <span className="text-xs text-muted-foreground">
            {formattedDate}
            {doc.file_name && " : "}
            {doc.file_name && (
              <span
                className="text-xs text-muted-foreground/80 truncate"
                title={doc.file_name}
              >
                {doc.file_name}
              </span>
            )}
          </span>
          {noteText && (
            <span
              className="text-xs text-muted-foreground/70 truncate"
              title={noteText}
            >
              {noteText}
            </span>
          )}
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            disabled={isProcessing || isLoadingUrl}
            className="flex-shrink-0"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleOpen()}>
            <FileText className="mr-2 h-4 w-4" />
            <span>{tCommon("openButton")}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onEdit(doc)}>
            <PencilIcon className="mr-2 h-4 w-4" />
            <span>{tCommon("editButton")}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleDeleteClick(doc.id)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>{tCommon("deleteButton")}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
}

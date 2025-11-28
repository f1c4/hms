"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  File,
  FileText,
  Loader2,
  MoreHorizontal,
  PencilIcon,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFormatDate } from "@/hooks/use-format-date";
import { PatientIdDocumentClientModel } from "@/types/client-models";
import { Badge } from "@/components/ui/badge";
import { useLocale, useTranslations } from "next-intl";

interface IdentityDocumentListItemProps {
  doc: PatientIdDocumentClientModel;
  isLoading: boolean;
  onEdit: (doc: PatientIdDocumentClientModel) => void;
  onDelete: (doc: PatientIdDocumentClientModel) => void;
  onOpenFile: (doc: PatientIdDocumentClientModel) => void;
  isFormOpen?: boolean;
}

export function IdentityDocumentListItem({
  doc,
  isLoading,
  onEdit,
  onDelete,
  onOpenFile,
  isFormOpen,
}: IdentityDocumentListItemProps) {
  const formatDate = useFormatDate();
  const hasFile = !!doc.file_path;
  const locale = useLocale();
  const tCommon = useTranslations("Common");

  const isExpired = doc.expiry_date
    ? new Date(doc.expiry_date) < new Date()
    : false;

  return (
    <li key={doc.id} className="flex items-center justify-between p-3">
      <button
        type="button"
        onClick={() => onOpenFile(doc)}
        disabled={!hasFile || isLoading}
        className={cn(
          "flex items-center gap-3 text-left",
          hasFile
            ? "cursor-pointer hover:opacity-80 transition-opacity"
            : "cursor-default"
        )}
      >
        <FileText
          className={cn(
            "h-5 w-5 shrink-0",
            hasFile ? "text-primary" : "text-muted-foreground"
          )}
        />
        <div className="flex flex-col text-sm text-muted-foreground grow gap-1 min-w-0">
          <div className="flex items-start gap-2">
            <p className="font-medium text-foreground text-base truncate">
              {doc.documentTypeTranslations
                ? doc.documentTypeTranslations[locale]
                : "Unknown Document Type"}
            </p>
            <div className="flex items-center gap-1">
              <Badge
                className="h-5 inline-flex items-center"
                variant={isExpired ? "destructive" : "secondary"}
              >
                {isExpired ? "Expired" : "Valid"}
              </Badge>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
          </div>

          {/* Secondary info row */}
          <div className="truncate">
            <p className="truncate" title={doc.document_number}>
              {doc.document_number}
            </p>
            <p className="text-xs">
              {tCommon("expiresAt")}
              {" : "}
              {formatDate(doc.expiry_date ?? undefined, "PPP")}
            </p>
          </div>
        </div>
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            disabled={isFormOpen || isLoading}
            className="shrink-0"
            aria-label="More options"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => onOpenFile(doc)}
            disabled={!hasFile || isLoading}
          >
            <File className="mr-2 h-4 w-4" />
            <span>Open</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onEdit(doc)} disabled={isFormOpen}>
            <PencilIcon className="mr-2 h-4 w-4" />
            <span>Edit</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDelete(doc)}
            className="text-destructive focus:text-destructive"
            disabled={isFormOpen}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
}

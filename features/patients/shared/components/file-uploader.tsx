"use client";

import { useCallback } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { toast } from "sonner";
import { UploadCloud, File as FileIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileUploaderProps {
  onFileSelect: (file: File | undefined) => void;
  selectedFile?: File;
  existingFileName?: string | null;
  onRemoveExistingFile: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function FileUploader({
  onFileSelect,
  selectedFile,
  existingFileName,
  onRemoveExistingFile,
  disabled,
  placeholder,
}: FileUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach(({ errors }) => {
          errors.forEach((err) => {
            toast.error(err.message);
          });
        });
        return;
      }

      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 50 * 1024 * 1024, // 50MB
    accept: {
      "image/*": [".jpeg", ".png", ".jpg"],
      "application/pdf": [".pdf"],
    },
    disabled,
  });

  // 4. SIMPLIFY the clear handler. It just tells the parent to set the file to undefined.
  const handleClearSelection = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onFileSelect(undefined);
  };

  const handleRemoveExisting = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onRemoveExistingFile();
  };

  const content = () => {
    if (existingFileName) {
      return (
        <div className="flex items-center justify-between w-full gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <FileIcon className="h-5 w-5 text-muted-foreground shrink-0" />
            <div className="min-w-0 table table-fixed w-full">
              <span className="block text-sm font-medium truncate">
                {existingFileName}
              </span>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={handleRemoveExisting}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    // 5. CHANGE this condition to use the `selectedFile` prop.
    if (selectedFile) {
      return (
        <div className="flex items-center justify-between w-full gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <FileIcon className="h-5 w-5 text-muted-foreground shrink-0" />
            <div className="min-w-0 table table-fixed w-full">
              <span className="block text-sm font-medium truncate">
                {selectedFile.name}
              </span>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={handleClearSelection}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    // Fallback content is fine
    return (
      <div className="flex flex-col items-center justify-center text-center">
        <UploadCloud className="h-8 w-8 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          {placeholder ||
            "Drag and drop a file here, or click to select a file. PDF, JPG, PNG up to 5MB."}
        </p>
      </div>
    );
  };

  return (
    <div>
      <div
        {...getRootProps()}
        className={cn(
          "relative flex items-center justify-center w-full h-full min-h-28 px-4 rounded-md border-2 border-dashed border-muted-foreground/25 transition-colors",
          isDragActive && "border-primary",
          !disabled && "cursor-pointer hover:border-primary/50",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <input {...getInputProps()} />
        {content()}
      </div>
    </div>
  );
}

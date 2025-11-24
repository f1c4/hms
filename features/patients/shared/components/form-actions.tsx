"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface FormActionsProps {
  isDirty: boolean;
  isPending: boolean;
  onCancel: () => void;
  onReset?: () => void;
}

export function FormActions({
  isDirty,
  isPending,
  onCancel,
  onReset,
}: FormActionsProps) {
  const tCommon = useTranslations("Common.Buttons");
  return (
    <div className="flex items-center justify-end gap-4 w-full">
      <Button
        type="button"
        variant="outline"
        onClick={isDirty ? onReset : onCancel}
      >
        {isDirty ? tCommon("resetButton") : tCommon("cancelButton")}
      </Button>

      <Button type="submit" disabled={!isDirty || isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {tCommon("saveButton")}
      </Button>
    </div>
  );
}

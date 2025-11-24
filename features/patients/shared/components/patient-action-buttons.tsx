"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus, X } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ButtonGroup } from "@/components/ui/button-group";

interface PatientActionButtonsProps {
  patientId: number | null;
}

export default function PatientActionButtons({
  patientId,
}: PatientActionButtonsProps) {
  const router = useRouter();
  const tCommon = useTranslations("Common.Buttons");
  const tPatient = useTranslations("Patient");

  return (
    <div className="flex items-center gap-2 shrink-0">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-block">
              <ButtonGroup>
                <Button
                  variant="default"
                  size="default"
                  disabled={!patientId}
                  style={{ pointerEvents: !patientId ? "none" : "auto" }}
                >
                  <Plus className="h-4 w-4" />
                  {tCommon("addExaminationButton")}
                </Button>
                <Button
                  className="m-0"
                  size="default"
                  // The onClick handler from props is now passed directly to the Button.
                  onClick={() => router.push("/dashboard/patients")}
                  variant="destructive"
                >
                  <X />
                </Button>
              </ButtonGroup>
            </div>
          </TooltipTrigger>
          {!patientId && (
            <TooltipContent>{tPatient("firstSaveExamination")}</TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

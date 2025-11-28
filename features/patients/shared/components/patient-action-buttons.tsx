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

  const isDisabled = !patientId;
  const tooltipText = isDisabled ? tPatient("firstSaveExamination") : null;

  return (
    <div className="flex items-center gap-2 shrink-0">
      <div className="inline-block">
        <ButtonGroup orientation="horizontal">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="default"
                  // don't use native disabled so tooltip can trigger
                  aria-disabled={isDisabled}
                  className={isDisabled ? "cursor-not-allowed opacity-60" : ""}
                  onClick={(e) => {
                    if (isDisabled) {
                      e.preventDefault();
                      e.stopPropagation();
                      return;
                    }
                    // TODO: add your real action here
                  }}
                >
                  <Plus className="h-4 w-4" />
                  {tCommon("addExaminationButton")}
                </Button>
              </TooltipTrigger>
              {tooltipText && <TooltipContent>{tooltipText}</TooltipContent>}
            </Tooltip>
          </TooltipProvider>

          <Button
            className="m-0"
            size="default"
            onClick={() => router.push("/dashboard/patients")}
            variant="destructive"
          >
            <X />
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
}

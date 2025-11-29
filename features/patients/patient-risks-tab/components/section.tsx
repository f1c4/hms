"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Form } from "@/components/ui/form";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormActions } from "../../shared/components/form-actions";
import { RiskInfoForm } from "./form";
import { RiskInfoList } from "./list";

import { usePatientRiskMutation } from "../hooks/use-risk-mutation";
import {
  PatientRiskFormInput,
  PatientRiskFormSchema,
} from "../schemas/schemas";
import { useFormatDate } from "@/hooks/use-format-date";
import { toast } from "sonner";
import { AnimatedSwap } from "@/components/animate-swap";
import { useRiskInfoForm } from "../hooks/use-form";
import { SectionButton } from "../../shared/components/section-button";

export function RiskInfoSection() {
  const formatDate = useFormatDate();
  const tSection = useTranslations("Patient.RisksNotifications");
  const tCommon = useTranslations("Common");
  const { mutate: saveInfo, isPending: isSaving } = usePatientRiskMutation();

  const {
    form,
    defaultValues,
    pristineData,
    sectionState,
    setSectionState,
    tValidation,
  } = useRiskInfoForm();

  const {
    handleSubmit,
    reset,
    formState: { isDirty },
  } = form;

  const { mode } = sectionState;
  const isEditing = mode === "edit";
  const isCreating = mode === "create";
  const hasData = !!pristineData?.risk;

  const createdAt = pristineData?.risk?.created_at;
  const updatedAt = pristineData?.risk?.updated_at;

  const title = useMemo(() => {
    return isCreating
      ? tSection("insertPatientRisks")
      : isEditing
      ? tSection("editPatientRisks")
      : tSection("viewPatientRisks");
  }, [isCreating, isEditing, tSection]);

  const onSubmit = (data: PatientRiskFormInput) => {
    const validatedData = PatientRiskFormSchema(tValidation).safeParse(data);

    if (validatedData.success) {
      saveInfo(validatedData.data);
    } else {
      console.error(
        "Form submission failed client-side validation:",
        validatedData.error
      );
      toast.error("Failed to validate form data. Please check the fields.");
    }
  };

  const handleCancel = () => {
    setSectionState("risk", "info", { mode: "view" });
    reset(defaultValues);
  };

  const handleEdit = () => {
    setSectionState("risk", "info", { mode: "edit" });
  };

  const handleAdd = () => {
    setSectionState("risk", "info", { mode: "create" });
  };

  const handleReset = () => {
    reset(defaultValues, {
      keepDirty: false,
      keepValues: false,
      keepDefaultValues: false,
    });
  };

  const isFormMode = isEditing || isCreating;

  return (
    <div className="flex flex-col">
      <AnimatedSwap
        activeKey={isFormMode ? "risk-info-form" : "risk-info-view"}
      >
        {isFormMode ? (
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Card>
                <CardHeader>
                  <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <RiskInfoForm
                    isEditing={isEditing}
                    isCreating={isCreating}
                    isSaving={isSaving}
                  />
                </CardContent>
                <CardFooter>
                  <FormActions
                    isDirty={isDirty}
                    isPending={isSaving}
                    onCancel={handleCancel}
                    onReset={handleReset}
                  />
                </CardFooter>
              </Card>
            </form>
          </Form>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              <CardAction>
                <SectionButton
                  hasData={hasData}
                  isCreating={isCreating}
                  isEditing={isEditing}
                  onCreate={handleAdd}
                  onEdit={handleEdit}
                />
              </CardAction>
            </CardHeader>
            <CardContent>
              {pristineData?.risk ? (
                <RiskInfoList />
              ) : (
                <Alert variant="default">
                  <AlertDescription className="px-3 py-2 text-sm">
                    {tSection("noRisksData")}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            {(createdAt || updatedAt) && (
              <CardFooter className="text-xs text-muted-foreground">
                <div className="flex flex-col w-full gap-1">
                  {createdAt && (
                    <span>
                      {tCommon("createdAt")} : {formatDate(createdAt, "PPPp")}
                    </span>
                  )}
                  {updatedAt && (
                    <span>
                      {tCommon("updatedAt")} : {formatDate(updatedAt, "PPPp")}
                    </span>
                  )}
                </div>
              </CardFooter>
            )}
          </Card>
        )}
      </AnimatedSwap>
    </div>
  );
}

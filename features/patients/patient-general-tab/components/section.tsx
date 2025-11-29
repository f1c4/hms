"use client";

import { useMemo } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { PencilIcon } from "lucide-react";

import { usePatientInfoMutation } from "../hooks/use-info-mutations";
import { useFormatDate } from "@/hooks/use-format-date";
import { PatientGeneralFormOutput } from "../schemas/info-form-schema";
import { GeneralInfoForm } from "./form";
import { GeneralInfoList } from "./list";
import { FormActions } from "@/features/patients/shared/components/form-actions";
import { AnimatedSwap } from "@/components/animate-swap";
import { useGeneralInfoForm } from "../hooks/use-form";

export function GeneralInfoSection() {
  const router = useRouter();
  const formatDate = useFormatDate();
  const tTranslations = useTranslations("Patient");
  const tCommon = useTranslations("Common");
  const { mutate: saveInfo, isPending: isSaving } = usePatientInfoMutation();

  const {
    form,
    defaultValues,
    isCreating,
    sectionState,
    setSectionState,
    pristineData,
  } = useGeneralInfoForm();

  const {
    handleSubmit,
    reset: resetForm,
    formState: { isDirty: isFormDirty },
  } = form;

  const { isDirty: isSectionDirty, mode } = sectionState;
  const isEditing = mode === "edit";

  const createdAt = pristineData?.general?.created_at;
  const updatedAt = pristineData?.general?.updated_at;

  const title = useMemo(() => {
    return isCreating
      ? tTranslations("createPatientGeneral")
      : isEditing
      ? tTranslations("editPatientGeneral")
      : tTranslations("viewPatientGeneral");
  }, [isCreating, isEditing, tTranslations]);

  const onSubmit = (data: PatientGeneralFormOutput) => {
    saveInfo(data);
  };

  const handleCancel = () => {
    if (isCreating && !isSectionDirty) {
      router.push("/dashboard/patients");
      return;
    }

    resetForm(defaultValues);
    setSectionState("general", "info", { mode: "view" });
  };

  const handleEdit = () => {
    setSectionState("general", "info", { mode: "edit" });
  };

  const handleReset = () => {
    resetForm();
  };

  const isFormMode = isEditing || isCreating;

  return (
    <div className="flex flex-col">
      <AnimatedSwap
        activeKey={isFormMode ? "general-info-form" : "general-info-view"}
      >
        {isFormMode ? (
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Card>
                <CardHeader>
                  <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <GeneralInfoForm isEditing={isEditing} isSaving={isSaving} />
                </CardContent>
                <CardFooter>
                  <FormActions
                    isDirty={isFormDirty}
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
                <Button variant="outline" size="sm" onClick={handleEdit}>
                  <PencilIcon className="mr-2 h-4 w-4" />
                  {tCommon("Buttons.editButton")}
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <GeneralInfoList />
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

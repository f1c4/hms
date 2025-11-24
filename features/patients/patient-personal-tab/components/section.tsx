"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";

import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";

import { usePatientPersonalMutation } from "../hooks/use-personal-mutataions";
import { useFormatDate } from "@/hooks/use-format-date";
import { useFields } from "../hooks/use-info-fields";

import { PatientPersonalFormType } from "../schemas/schemas";

import { PersonalInfoForm } from "./form";
import { PersonalInfoList } from "./list";
import { FormActions } from "../../shared/components/form-actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AnimatedSwap } from "@/components/animate-swap";
import { usePersonalInfoForm } from "../hooks/use-form";
import { SectionButton } from "../../shared/components/section-button";

export function PersonalInfoSection() {
  const formatDate = useFormatDate();
  const tSection = useTranslations("Patient.PersonalNotifications");
  const tCommon = useTranslations("Common");
  const { mutate: saveInfo, isPending: isSaving } =
    usePatientPersonalMutation();

  const { infoFields } = useFields();

  const { form, defaultValues, pristineData, sectionState, setSectionState } =
    usePersonalInfoForm();

  const {
    handleSubmit,
    reset,
    formState: { isDirty },
  } = form;

  const { mode } = sectionState;
  const isEditing = mode === "edit";
  const isCreating = mode === "create";
  const hasData = !!pristineData?.personal;

  const createdAt = pristineData?.personal?.created_at;
  const updatedAt = pristineData?.personal?.updated_at;

  const title = useMemo(() => {
    return isCreating
      ? tSection("createPatientPersonal")
      : isEditing
      ? tSection("editPatientPersonal")
      : tSection("viewPatientPersonal");
  }, [isCreating, isEditing, tSection]);

  const onSubmit = (data: PatientPersonalFormType) => {
    saveInfo(data);
  };

  const handleCancel = () => {
    setSectionState("personal", "info", { mode: "view" });
    // optional: reset back to last pristine values when leaving edit/create
    reset(defaultValues);
  };

  const handleEdit = () => {
    setSectionState("personal", "info", { mode: "edit" });
  };

  const handleAdd = () => {
    setSectionState("personal", "info", { mode: "create" });
  };

  const handleReset = () => {
    reset(defaultValues, {
      keepValues: false,
      keepDirty: false,
      keepDefaultValues: false,
      keepIsSubmitted: false,
      keepTouched: false,
      keepErrors: false,
    });
  };

  const isFormMode = isEditing || isCreating;

  return (
    <div className="flex flex-col">
      <AnimatedSwap
        activeKey={isFormMode ? "personal-info-form" : "personal-info-view"}
      >
        {isFormMode ? (
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Card>
                <CardHeader>
                  <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <PersonalInfoForm
                    isSaving={isSaving}
                    isCreating={isCreating}
                    isEditing={isEditing}
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
                  isEditing={isEditing}
                  isCreating={isCreating}
                  hasData={hasData}
                  onEdit={handleEdit}
                  onCreate={handleAdd}
                />
              </CardAction>
            </CardHeader>
            <CardContent>
              {pristineData?.personal ? (
                <PersonalInfoList fields={infoFields} />
              ) : (
                <Alert variant="default">
                  <AlertDescription className="px-3 py-2 text-sm">
                    {tSection("noPersonalData")}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            {(createdAt || updatedAt) && (
              <CardFooter className="text-xs text-muted-foreground">
                <div className="flex flex-col md:flex-row md:justify-between w-full gap-2">
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

"use client";

import { useEffect, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useMainStore } from "@/store/main-store";
import { useShallow } from "zustand/react/shallow";

import {
  InsuranceClientSchema,
  InsuranceFormInput,
} from "../../schemas/insurance-form-schema";
import { useInsuranceMutations } from "../../hooks/insurances/use-insurance-mutation";
import {
  getInsuranceProviders,
  getInsurancePlans,
} from "../../actions/actions-insurance";
import { PatientInsuranceClientModel } from "@/types/client-models";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { DatePicker } from "@/features/patients/shared/components/date-picker";
import { DatabaseSelect } from "@/features/patients/shared/components/db-select";
import { FileUploader } from "../../../shared/components/file-uploader";
import { FormActions } from "@/features/patients/shared/components/form-actions";

function createFileList(file: File): FileList {
  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file);
  return dataTransfer.files;
}

interface InsuranceFormProps {
  itemToEdit?: PatientInsuranceClientModel | null;
  onClose: () => void;
}

export function InsuranceForm({ itemToEdit, onClose }: InsuranceFormProps) {
  // Internalization
  const locale = useLocale();
  const defaultLocale = "en";
  const t = useTranslations("Patient.GeneralInsurance");
  const tFields = useTranslations("Patient.GeneralInsuranceForm");
  const tValidation = useTranslations("Patient.GeneralInsuranceValidation");

  const { sectionState, setSectionState } = useMainStore(
    useShallow((state) => ({
      sectionState: state.patient.uiState.documents.insurance,
      setSectionState: state.patient.actions.setSectionState,
    }))
  );

  const {
    createInsurance,
    updateInsurance,
    isProcessing,
    progress,
    processingLabel,
  } = useInsuranceMutations();

  const defaultValues = useMemo(
    () => ({
      providerId: itemToEdit?.plan.provider_id,
      planId: itemToEdit?.plan_id,
      policyNumber: itemToEdit?.policy_number ?? "",
      lboNumber: itemToEdit?.lbo_number ?? "",
      effectiveDate: itemToEdit?.effective_date
        ? new Date(itemToEdit.effective_date)
        : undefined,
      expiryDate: itemToEdit?.expiry_date
        ? new Date(itemToEdit.expiry_date)
        : undefined,
      file: undefined,
      wantsToRemoveFile: false,
    }),
    [itemToEdit]
  );

  const form = useForm<InsuranceFormInput>({
    resolver: zodResolver(InsuranceClientSchema(tValidation)),
    defaultValues,
  });

  const {
    formState: { isDirty: isFormDirty },
  } = form;

  const wantsToRemoveFile = form.watch("wantsToRemoveFile");
  const selectedProviderId = form.watch("providerId");

  const { data: providers = [], isLoading: isLoadingProviders } = useQuery({
    queryKey: ["insurance-providers"],
    queryFn: getInsuranceProviders,
  });

  const { data: plans = [], isLoading: isLoadingPlans } = useQuery({
    queryKey: ["insurance-plans", selectedProviderId],
    queryFn: () => getInsurancePlans(selectedProviderId),
    enabled: !!selectedProviderId,
  });

  useEffect(() => {
    form.resetField("planId");
  }, [selectedProviderId, form]);

  const providerOptions = useMemo(
    () =>
      providers.map((p) => ({
        value: p.id,
        label:
          p.name_translations?.[locale] ??
          p.name_translations?.[defaultLocale] ??
          t("unnamedProvider"),
      })),
    [providers, locale, defaultLocale, t]
  );

  const planOptions = useMemo(
    () =>
      plans.map((p) => ({
        value: p.id,
        label:
          p.name_translations?.[locale] ??
          p.name_translations?.[defaultLocale] ??
          t("unnamedPlan"),
      })),
    [plans, locale, defaultLocale, t]
  );

  const onSubmit = (data: InsuranceFormInput) => {
    if (itemToEdit) {
      updateInsurance.mutate(
        { formData: data, existingIns: itemToEdit },
        { onSuccess: (res) => !res.error && onClose() }
      );
    } else {
      createInsurance.mutate(data, {
        onSuccess: (res) => !res.error && onClose(),
      });
    }
  };

  const isPending = createInsurance.isPending || updateInsurance.isPending;
  const isSectionDirty = sectionState.isDirty;

  // Sync form dirty state with the store
  useEffect(() => {
    if (isFormDirty !== isSectionDirty) {
      setSectionState("documents", "insurance", { isDirty: isFormDirty });
    }
  }, [isFormDirty, isSectionDirty, setSectionState]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="providerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tFields("providerLabel")}</FormLabel>
                <FormControl>
                  <DatabaseSelect
                    options={providerOptions}
                    isLoading={isLoadingProviders}
                    disabled={isPending}
                    placeholder={tFields("providerPlaceholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="planId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tFields("planLabel")}</FormLabel>
                <FormControl>
                  <DatabaseSelect
                    options={planOptions}
                    isLoading={isLoadingPlans}
                    disabled={isPending || !selectedProviderId}
                    placeholder={tFields("planPlaceholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="policyNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tFields("policyNumberLabel")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isPending}
                    placeholder={tFields("policyNumberPlaceholder")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lboNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tFields("lboNumberLabel")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isPending}
                    placeholder={tFields("lboNumberPlaceholder")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="effectiveDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tFields("effectiveDateLabel")}</FormLabel>
                <FormControl>
                  <DatePicker
                    value={field.value}
                    disableDirection="none"
                    onChange={field.onChange}
                    disabled={isPending}
                    startMonth={new Date(1900, 0)}
                    endMonth={new Date()}
                    placeholder={tFields("effectiveDatePlaceholder")}
                    id={field.name}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="expiryDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tFields("expiryDateLabel")}</FormLabel>
                <FormControl>
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isPending}
                    disableDirection="none"
                    startMonth={new Date()}
                    endMonth={new Date(new Date().getFullYear() + 50, 11)}
                    placeholder={tFields("expiryDatePlaceholder")}
                    id={field.name}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="min-w-0">
          <Controller
            name="file"
            control={form.control}
            render={({ field: { onChange, value } }) => (
              <FormItem>
                <FormLabel>{tFields("fileUploadLabel")}</FormLabel>
                <FileUploader
                  onFileSelect={(file) => {
                    form.setValue("wantsToRemoveFile", false);
                    onChange(file ? createFileList(file) : undefined);
                  }}
                  selectedFile={value?.[0]}
                  existingFileName={
                    !value?.[0] && !wantsToRemoveFile
                      ? itemToEdit?.file_name
                      : undefined
                  }
                  onRemoveExistingFile={() => {
                    form.setValue("wantsToRemoveFile", true, {
                      shouldDirty: true,
                    });
                  }}
                  disabled={isPending}
                  placeholder={tFields("fileUploadPlaceholder")}
                />
              </FormItem>
            )}
          />
          {isProcessing && (
            <div className="space-y-2 mt-2">
              <div className="flex justify-between text-sm">
                <span>{processingLabel}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <FormActions
            isDirty={form.formState.isDirty}
            isPending={isPending}
            onCancel={onClose}
            onReset={() => form.reset(defaultValues)}
          />
        </div>
      </form>
    </Form>
  );
}

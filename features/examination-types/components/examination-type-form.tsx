"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useExaminationCategories } from "@/features/examination-categories/hooks/use-examination-categories";
import { DatabaseSelectAddModal } from "@/features/examination-categories/components/db-select-add-modal";

import {
  ExaminationTypeFormSchema,
  ExaminationTypeFormInput,
  ExaminationTypeCreatePayload,
  ExaminationTypeUpdatePayload,
} from "../schemas";
import { useExaminationTypeMutations } from "../hooks/use-examination-types";
import type { ExaminationTypeModel } from "../types";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ColorPicker } from "@/components/ui/color-picker";
import { ExaminationCategoryForm } from "@/features/examination-categories/components/examination-category-form";
import { useState } from "react";

interface ExaminationTypeFormProps {
  itemToEdit?: ExaminationTypeModel | null;
  onClose: () => void;
}

export function ExaminationTypeForm({
  itemToEdit,
  onClose,
}: ExaminationTypeFormProps) {
  const locale = useLocale();
  const tValidation = useTranslations("Examinations.Validation");
  const tForm = useTranslations("Examinations.Form");
  const t = useTranslations("Examinations");
  const tCommon = useTranslations("Common.Buttons");
  const tProgress = useTranslations("Common.Progress");

  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    refetch: refetchCategories,
  } = useExaminationCategories();
  const { createExaminationType, updateExaminationType } =
    useExaminationTypeMutations();

  const form = useForm<ExaminationTypeFormInput>({
    resolver: zodResolver(ExaminationTypeFormSchema(tValidation)),
    defaultValues: {
      typeKey: itemToEdit?.type_key ?? "",
      name:
        itemToEdit?.name_translations?.[locale] ||
        itemToEdit?.name_translations?.["en"] ||
        "",
      description:
        itemToEdit?.description_translations?.[locale] ||
        itemToEdit?.description_translations?.["en"] ||
        "",
      preparationInstructions:
        itemToEdit?.preparation_instructions_translations?.[locale] ||
        itemToEdit?.preparation_instructions_translations?.["en"] ||
        "",
      durationMinutes: itemToEdit?.duration_minutes ?? 30,
      basePrice: itemToEdit?.base_price ?? undefined,
      categoryId: itemToEdit?.category_id ?? null,
      color: itemToEdit?.color ?? "",
      isActive: itemToEdit?.is_active ?? true,
      requiresReferral: itemToEdit?.requires_referral ?? false,
      requiresFasting: itemToEdit?.requires_fasting ?? false,
      requiresAppointment: itemToEdit?.requires_appointment ?? true,
    },
  });

  const onSubmit = (data: ExaminationTypeFormInput) => {
    // Build server payload
    const basePayload = {
      type_key: data.typeKey,
      name_translations: { [locale]: data.name },
      duration_minutes: data.durationMinutes,
      base_price: data.basePrice ?? null,
      category_id: data.categoryId ?? null,
      color: data.color || null,
      is_active: data.isActive,
      requires_referral: data.requiresReferral,
      requires_fasting: data.requiresFasting,
      requires_appointment: data.requiresAppointment,
      ai_source_locale: locale,
      description_translations: data.description
        ? { [locale]: data.description }
        : null,
      preparation_instructions_translations: data.preparationInstructions
        ? { [locale]: data.preparationInstructions }
        : null,
    };

    if (itemToEdit) {
      const payload: ExaminationTypeUpdatePayload = basePayload;
      updateExaminationType.mutate(
        { id: itemToEdit.id, payload },
        { onSuccess: () => onClose() }
      );
    } else {
      const payload: ExaminationTypeCreatePayload = basePayload;
      createExaminationType.mutate(payload, { onSuccess: () => onClose() });
    }
  };

  const handleCategoryAdded = (newCategoryId: number) => {
    // Set the newly created category as selected
    form.setValue("categoryId", newCategoryId);
    // Refetch categories to include the new one
    refetchCategories();
    // Close the modal
    setCategoryModalOpen(false);
  };

  const isPending =
    createExaminationType.isPending || updateExaminationType.isPending;

  // Transform categories to ComboboxOption format
  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Name & Type Key */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-baseline">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tForm("name")} *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder={tForm("namePlaceholder")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="typeKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tForm("typeKey")} *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending || !!itemToEdit}
                      placeholder={tForm("typeKeyPlaceholder")}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    {tForm("typeKeyHint")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Duration, Price & Category */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <FormField
              control={form.control}
              name="durationMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tForm("duration")} *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min={1}
                      max={480}
                      disabled={isPending}
                      placeholder={tForm("durationPlaceholder")}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="basePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tForm("price")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min={0}
                      step={0.01}
                      disabled={isPending}
                      placeholder={tForm("pricePlaceholder")}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tForm("category")}</FormLabel>
                  <FormControl>
                    <DatabaseSelectAddModal
                      options={categoryOptions}
                      value={field.value ?? undefined}
                      onChange={(value) => field.onChange(value ?? null)}
                      onBlur={field.onBlur}
                      placeholder={tForm("categoryPlaceholder")}
                      searchPlaceholder={tForm("searchCategory")}
                      emptyPlaceholder={tForm("noCategoriesFound")}
                      isLoading={categoriesLoading}
                      disabled={isPending}
                      allowAddNew={true}
                      onAddNew={() => setCategoryModalOpen(true)}
                      addNewLabel={tForm("addNewCategory")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Color */}
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tForm("color")}</FormLabel>
                  <FormControl>
                    <ColorPicker
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tForm("description")}</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    disabled={isPending}
                    placeholder={tForm("descriptionPlaceholder")}
                    rows={2}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Preparation Instructions */}
          <FormField
            control={form.control}
            name="preparationInstructions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tForm("preparationInstructions")}</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    disabled={isPending}
                    placeholder={tForm("preparationInstructionsPlaceholder")}
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Boolean Flags */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="requiresReferral"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>{t("requiresReferral")}</FormLabel>
                    <FormDescription className="text-xs">
                      {t("requiresReferralDescription")}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isPending}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="requiresFasting"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>{t("requiresFasting")}</FormLabel>
                    <FormDescription className="text-xs">
                      {t("requiresFastingDescription")}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isPending}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="requiresAppointment"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>{t("requiresAppointment")}</FormLabel>
                    <FormDescription className="text-xs">
                      {t("requiresAppointmentDescription")}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isPending}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              {tCommon("cancelButton")}
            </Button>
            <Button
              type="submit"
              disabled={!form.formState.isDirty || isPending}
            >
              {isPending ? tProgress("saving") : tCommon("saveButton")}
            </Button>
          </div>
        </form>
      </Form>
      {/* Category Creation Modal */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setCategoryModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{tForm("addNewCategoryTitle")}</DialogTitle>
            <DialogDescription>
              {tForm("addNewCategoryDescription")}
            </DialogDescription>
          </DialogHeader>
          <ExaminationCategoryForm
            onClose={() => setCategoryModalOpen(false)}
            onSuccess={handleCategoryAdded}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

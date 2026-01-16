"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";

import {
  ExaminationCategoryFormSchema,
  ExaminationCategoryFormInput,
  ExaminationCategoryCreatePayload,
} from "../schemas";
import { useExaminationCategoryMutations } from "../hooks/use-examination-category-mutations";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ExaminationCategoryFormProps {
  onClose: () => void;
  onSuccess?: (categoryId: number) => void;
}

export function ExaminationCategoryForm({
  onClose,
  onSuccess,
}: ExaminationCategoryFormProps) {
  const locale = useLocale();
  const tValidation = useTranslations("Examinations.Validation");
  const tForm = useTranslations("Examinations.Form");
  const tCommon = useTranslations("Common.Buttons");
  const tProgress = useTranslations("Common.Progress");

  const { createExaminationCategory } = useExaminationCategoryMutations();

  const form = useForm<ExaminationCategoryFormInput>({
    resolver: zodResolver(ExaminationCategoryFormSchema(tValidation)),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = (data: ExaminationCategoryFormInput) => {
    // Build server payload
    const payload: ExaminationCategoryCreatePayload = {
      name_translations: { [locale]: data.name },
      ai_source_locale: locale,
    };

    createExaminationCategory.mutate(payload, {
      onSuccess: (result) => {
        // Call the onSuccess callback with the new category ID
        if (onSuccess && result?.id) {
          onSuccess(result.id);
        }
        // Close the modal (parent handles this, but we can also close here)
        onClose();
      },
    });
  };

  const isPending = createExaminationCategory.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{tForm("categoryName")} *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isPending}
                  placeholder={tForm("categoryNamePlaceholder")}
                  autoFocus
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
          >
            {tCommon("cancelButton")}
          </Button>
          <Button type="submit" disabled={!form.formState.isDirty || isPending}>
            {isPending ? tProgress("saving") : tCommon("saveButton")}
          </Button>
        </div>
      </form>
    </Form>
  );
}

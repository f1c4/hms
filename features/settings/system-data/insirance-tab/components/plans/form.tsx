"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";

import { PlanClientSchema, PlanFormInput } from "../../schemas/plan-schema";
import { usePlanMutations } from "../../hooks/use-plans";
import { InsurancePlanAdminModel } from "@/types/data-models";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface PlanFormProps {
  providerId: number;
  itemToEdit?: InsurancePlanAdminModel | null;
  onClose: () => void;
}

export function PlanForm({ providerId, itemToEdit, onClose }: PlanFormProps) {
  const t = useTranslations("Settings.Insurance.Validation");
  const locale = useLocale();
  const defaultLocale = "en";
  const { createPlan, updatePlan } = usePlanMutations();

  const form = useForm<PlanFormInput>({
    resolver: zodResolver(PlanClientSchema(t)),
    defaultValues: {
      name:
        itemToEdit?.name_translations?.[locale] ??
        itemToEdit?.name_translations?.[defaultLocale] ??
        "",
      description:
        itemToEdit?.description_translations?.[locale] ??
        itemToEdit?.description_translations?.[defaultLocale] ??
        "",
    },
  });

  const onSubmit = (data: PlanFormInput) => {
    if (itemToEdit) {
      updatePlan.mutate(
        { formData: data, planId: itemToEdit.id },
        { onSuccess: () => onClose() }
      );
    } else {
      createPlan.mutate(
        { formData: data, providerId },
        { onSuccess: () => onClose() }
      );
    }
  };

  const isPending = createPlan.isPending || updatePlan.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plan Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isPending}
                  placeholder="e.g., Gold Tier"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  disabled={isPending}
                  placeholder="Describe the plan's coverage or key features..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={!form.formState.isDirty || isPending}>
            {isPending ? "Saving..." : "Save Plan"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

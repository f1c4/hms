"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";

import {
  ProviderClientSchema,
  ProviderFormInput,
} from "../../schemas/provider-schema";

import { useProviderMutations } from "../../hooks/use-providers";
import { InsuranceProviderAdminModel } from "@/types/data-models";

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

interface ProviderFormProps {
  itemToEdit?: InsuranceProviderAdminModel | null;
  onClose: () => void;
}

export function ProviderForm({ itemToEdit, onClose }: ProviderFormProps) {
  const t = useTranslations("Settings.Insurance.Validation");
  const locale = useLocale();
  const defaultLocale = "en";
  const { createProvider, updateProvider } = useProviderMutations();

  const form = useForm<ProviderFormInput>({
    resolver: zodResolver(ProviderClientSchema(t)),
    defaultValues: {
      name:
        itemToEdit?.name_translations?.[locale] ??
        itemToEdit?.name_translations?.[defaultLocale] ??
        "",
      contactInfo: (itemToEdit?.contact_info as { notes: string })?.notes ?? "",
    },
  });

  const onSubmit = (data: ProviderFormInput) => {
    if (itemToEdit) {
      updateProvider.mutate(
        { formData: data, providerId: itemToEdit.id },
        { onSuccess: () => onClose() }
      );
    } else {
      createProvider.mutate(data, { onSuccess: () => onClose() });
    }
  };

  const isPending = createProvider.isPending || updateProvider.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Provider Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isPending}
                  placeholder="e.g., Global Health Inc."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contactInfo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Info / Notes</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  disabled={isPending}
                  placeholder="Add any relevant contact details or notes..."
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
            {isPending ? "Saving..." : "Save Provider"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

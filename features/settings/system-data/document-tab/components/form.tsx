"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";

import {
  DocTypeClientSchema,
  DocTypeFormInput,
} from "../schemas/doc-type-schema";
import { useDocTypeMutations } from "../hooks/use-doc-type";
import { MedicalDocumentTypeModel } from "@/types/data-models";

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

interface DocTypeFormProps {
  itemToEdit?: MedicalDocumentTypeModel | null;
  onClose: () => void;
}

export function DocTypeForm({ itemToEdit, onClose }: DocTypeFormProps) {
  const t = useTranslations("Settings.DocTypes.Validation");
  const locale = useLocale();
  const defaultLocale = "en";
  const { createDocType, updateDocType } = useDocTypeMutations();

  const form = useForm<DocTypeFormInput>({
    resolver: zodResolver(DocTypeClientSchema(t)),
    defaultValues: {
      name:
        itemToEdit?.name_translations?.[locale] ??
        itemToEdit?.name_translations?.[defaultLocale] ??
        "",
      key: itemToEdit?.type_key ?? "",
    },
  });

  const onSubmit = (data: DocTypeFormInput) => {
    if (itemToEdit) {
      updateDocType.mutate(
        { formData: data, docTypeId: itemToEdit.id },
        { onSuccess: () => onClose() }
      );
    } else {
      createDocType.mutate(data, { onSuccess: () => onClose() });
    }
  };

  const isPending = createDocType.isPending || updateDocType.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isPending}
                  placeholder="e.g., Lab Analysis"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="key"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unique Key</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isPending || !!itemToEdit} // Disable key editing
                  placeholder="e.g., lab_analysis"
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
            {isPending ? "Saving..." : "Save Type"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

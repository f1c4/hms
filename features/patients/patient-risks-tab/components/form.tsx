"use client";

import React, { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";
import { useRiskFields } from "../hooks/use-form-fields";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PatientRiskFormInput } from "../schemas/schemas";
import { Separator } from "@/components/ui/separator";

interface RiskInfoFormProps {
  isEditing: boolean;
  isCreating?: boolean;
  isSaving: boolean;
}

export function RiskInfoForm({
  isEditing,
  isSaving,
  isCreating,
}: RiskInfoFormProps) {
  const { control } = useFormContext<PatientRiskFormInput>();
  const fields = useRiskFields();
  const isDisabled = isSaving || (!isEditing && !isCreating);

  const groupedFields = useMemo(() => {
    return fields.reduce((acc, field) => {
      const group = field.group || "biometrics";
      if (!acc[group]) acc[group] = [];
      acc[group].push(field);
      return acc;
    }, {} as Record<string, typeof fields>);
  }, [fields]);

  const groupOrder: (keyof typeof groupedFields)[] = [
    "biometrics",
    "measurements",
    "lifestyle",
  ];

  const renderField = (formField: (typeof fields)[0]) => {
    const fieldName = formField.name;

    if (formField.type === "select") {
      return (
        <FormField
          key={fieldName}
          control={control}
          name={fieldName}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{formField.label}</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={(field.value as string) ?? ""}
                disabled={isDisabled}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={formField.placeholder} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {formField.options?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }

    return (
      <FormField
        key={fieldName}
        control={control}
        name={fieldName}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{formField.label}</FormLabel>
            <FormControl>
              <Input
                type={formField.type}
                placeholder={formField.placeholder}
                disabled={isDisabled}
                {...field}
                value={field.value ?? ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  return (
    <fieldset disabled={isDisabled} className="space-y-4 border-0 p-0 m-0">
      {groupOrder.map((groupKey, index) => {
        const groupFields = groupedFields[groupKey];
        if (!groupFields || groupFields.length === 0) return null;

        return (
          <React.Fragment key={groupKey}>
            {index > 0 && <Separator />}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {groupFields.map(renderField)}
            </div>
          </React.Fragment>
        );
      })}
    </fieldset>
  );
}

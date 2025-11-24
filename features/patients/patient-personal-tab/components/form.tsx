"use client";

import React, { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";

// UI Components
import { Input } from "@/components/ui/input";
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
import { Separator } from "@/components/ui/separator";
import { DatabaseSelectVirtualNew } from "@/features/patients/shared/components/db-select-virtual";

// Hooks and Types
import { usePersonalFields } from "../hooks/use-form-fields";
import { PatientPersonalFormType } from "../schemas/schemas";
import { useCountryOptions } from "@/features/patients/shared/hooks/use-country-options";
import {
  useCityMutation,
  useCityOptions,
} from "@/features/patients/shared/hooks/use-city-options";

interface PersonalInfoFormProps {
  isSaving: boolean;
  isEditing?: boolean;
  isCreating?: boolean;
}

export function PersonalInfoForm({
  isSaving,
  isEditing,
  isCreating,
}: PersonalInfoFormProps) {
  const { control, watch } = useFormContext<PatientPersonalFormType>();
  const fields = usePersonalFields();
  const tForm = useTranslations("Patient.PersonalForm");
  const tNotification = useTranslations("Patient.PersonalNotifications");

  const watchedBirthCountryId = watch("birthCountryId");
  const { countryOptions, isLoadingCountries } = useCountryOptions();
  const { insertCity, isInsertingCity } = useCityMutation();
  const { cityOptions, isLoadingCities } = useCityOptions(
    watchedBirthCountryId
  );

  const isDisabled = isSaving || (!isEditing && !isCreating);

  const cityAddNewFields = [
    {
      name: "name",
      label: tForm("cityNameLabel"),
      placeholder: tForm("cityNamePlaceholder"),
    },
    {
      name: "postal_code",
      label: tForm("postalCodeLabel"),
      placeholder: tForm("postalCodePlaceholder"),
    },
  ];

  const groupedFields = useMemo(() => {
    return fields.reduce((acc, field) => {
      const group = field.group || "origin";
      if (!acc[group]) acc[group] = [];
      acc[group].push(field);
      return acc;
    }, {} as Record<string, typeof fields>);
  }, [fields]);

  const groupOrder: (keyof typeof groupedFields)[] = [
    "origin",
    "social",
    "professional",
  ];

  // --- Render function defined inside the component ---
  const renderField = (formField: (typeof fields)[0]) => {
    const fieldName = formField.name;

    if (fieldName === "birthCountryId") {
      return (
        <FormField
          key={fieldName}
          control={control}
          name={fieldName}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{formField.label}</FormLabel>
              <FormControl>
                <DatabaseSelectVirtualNew
                  options={countryOptions}
                  value={field.value ?? undefined}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder={formField.placeholder}
                  isLoading={isLoadingCountries}
                  disabled={isDisabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }

    if (fieldName === "birthCityId") {
      return (
        <FormField
          key={fieldName}
          control={control}
          name={fieldName}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{formField.label}</FormLabel>
              <FormControl>
                <DatabaseSelectVirtualNew
                  options={cityOptions}
                  value={field.value ?? undefined}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder={formField.placeholder}
                  isLoading={isLoadingCities}
                  disabled={isDisabled || !watchedBirthCountryId}
                  disabledTooltip={tNotification("birthCityDisabledTooltip")}
                  allowAddNew={true}
                  addNewFields={cityAddNewFields}
                  onInsert={insertCity}
                  isInserting={isInsertingCity}
                  insertContext={{
                    country_id: watchedBirthCountryId ?? undefined,
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }

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
                value={field.value ?? ""}
                disabled={isDisabled}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={formField.placeholder} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {formField.options?.map((option) => (
                    <SelectItem key={option.value} value={option.value ?? ""}>
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

    // Default Text Input
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
                {...field}
                placeholder={formField.placeholder}
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
              {/* Simplified call to renderField */}
              {groupFields.map(renderField)}
            </div>
          </React.Fragment>
        );
      })}
    </fieldset>
  );
}

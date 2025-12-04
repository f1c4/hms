"use client";

import { useMemo } from "react";
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
import { DatePicker } from "@/features/patients/shared/components/date-picker";
import { DatabaseSelectVirtualNew } from "@/features/patients/shared/components/db-select-virtual";

// Hooks and Types
import { useFormFields } from "../hooks/use-form-fields";
import { PatientGeneralFormInput } from "../schemas/info-form-schema";
import { useCountryOptions } from "@/features/patients/shared/hooks/use-country-options";
import {
  useCityMutation,
  useCityOptions,
} from "@/features/patients/shared/hooks/use-city-options";
import { Separator } from "@/components/ui/separator";
import {
  SelectTrigger,
  Select,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface GeneralInfoFormProps {
  isSaving: boolean;
  isEditing?: boolean;
}

export function GeneralInfoForm({ isSaving, isEditing }: GeneralInfoFormProps) {
  const { control, watch } = useFormContext<PatientGeneralFormInput>();
  const fields = useFormFields();

  const watchedResidenceCountryId = watch("residenceCountryId");

  const { countryOptions, isLoadingCountries } = useCountryOptions();
  const { insertCity, isInsertingCity } = useCityMutation();
  const { cityOptions, isLoadingCities } = useCityOptions(
    watchedResidenceCountryId
  );
  const tForm = useTranslations("Patient.GeneralForm");
  const tNotification = useTranslations("Patient.GeneralNotifications");
  const tCommon = useTranslations("Common");

  const isDisabled = isSaving && !isEditing;

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
      const group = field.group || "primary";
      if (!acc[group]) acc[group] = [];
      acc[group].push(field);
      return acc;
    }, {} as Record<string, typeof fields>);
  }, [fields]);

  const groupOrder: (keyof typeof groupedFields)[] = [
    "primary",
    "citizenship",
    "residence",
    "emergency",
  ];

  const renderField = (formField: (typeof fields)[0]) => {
    const fieldName = formField.name;

    // --- Special Field Renderers ---
    if (
      fieldName === "citizenshipCountryId" ||
      fieldName === "residenceCountryId"
    ) {
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

    if (fieldName === "residenceCityId") {
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
                  addNewPlaceholder={tCommon("Buttons.addButton")}
                  options={cityOptions}
                  value={field.value ?? undefined}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder={formField.placeholder}
                  isLoading={isLoadingCities}
                  disabled={isDisabled || !watchedResidenceCountryId}
                  disabledTooltip={tNotification("birthCityDisabledTooltip")}
                  allowAddNew={true}
                  addNewFields={cityAddNewFields}
                  onInsert={insertCity}
                  isInserting={isInsertingCity}
                  insertContext={{
                    country_id: watchedResidenceCountryId ?? undefined,
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }

    if (formField.type === "date") {
      return (
        <FormField
          key={fieldName}
          control={control}
          name={fieldName}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{formField.label}</FormLabel>
              <FormControl>
                <DatePicker
                  value={field.value instanceof Date ? field.value : undefined}
                  onChange={field.onChange}
                  disabled={isDisabled}
                  placeholder={formField.placeholder}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }

    if (formField.type === "numeric-string") {
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
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder={formField.placeholder}
                  disabled={isDisabled}
                  {...field}
                  value={(field.value as string) ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }

    // --- RENDER SELECT FIELDS ---
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
                value={field.value as string | undefined}
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

    // --- Default Text Input ---
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
                type="text"
                placeholder={formField.placeholder}
                disabled={isDisabled}
                {...field}
                value={(field.value as string) ?? ""}
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
          <div key={groupKey} className="space-y-4">
            {index > 0 && <Separator />}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {groupFields.map(renderField)}
            </div>
          </div>
        );
      })}
    </fieldset>
  );
}

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";

import {
  CompanyFormSchema,
  CompanyFormInput,
  CompanyServerInput,
} from "../schemas/company-schema";
import { useCompanyMutations } from "../hooks/use-companies";
import { CompaniesTypeDb } from "@/types/data-models";
import { useCompanyTypes } from "../hooks/use-company-types";
import { useCountryOptions } from "@/features/patients/shared/hooks/use-country-options";
import {
  useCityMutation,
  useCityOptions,
} from "@/features/patients/shared/hooks/use-city-options";
import { DatabaseSelectVirtualNew } from "@/features/patients/shared/components/db-select-virtual";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface CompanyFormProps {
  itemToEdit?: CompaniesTypeDb["Row"] | null;
  onClose: () => void;
}

export function CompanyForm({ itemToEdit, onClose }: CompanyFormProps) {
  const t = useTranslations("Companies.Validation");
  const tCompanies = useTranslations("Companies");
  const tCommon = useTranslations("Common.Buttons");
  const tProgress = useTranslations("Common.Progress");
  const { createCompany, updateCompany } = useCompanyMutations();
  const { options: companyTypes } = useCompanyTypes();

  // Country and City hooks
  const { countryOptions, isLoadingCountries } = useCountryOptions();

  const form = useForm<CompanyFormInput>({
    resolver: zodResolver(CompanyFormSchema(t)),
    defaultValues: {
      name: itemToEdit?.name ?? "",
      tin: itemToEdit?.tin ?? "",
      vat: itemToEdit?.vat ?? "",
      registration_number: itemToEdit?.registration_number ?? "",
      address: itemToEdit?.address ?? "",
      city_id: itemToEdit?.city_id ?? null,
      country_id: itemToEdit?.country_id ?? null,
      phone: itemToEdit?.phone ?? "",
      email: itemToEdit?.email ?? "",
      website: itemToEdit?.website ?? "",
      type: (itemToEdit?.type as CompanyFormInput["type"]) ?? "company",
      discount_percentage: Number(itemToEdit?.discount_percentage) || 0,
      is_partner: itemToEdit?.is_partner ?? false,
    },
  });

  const watchedCountryId = form.watch("country_id");
  const watchedIsPartner = form.watch("is_partner");
  const { cityOptions, isLoadingCities } = useCityOptions(watchedCountryId);
  const { insertCity, isInsertingCity } = useCityMutation();

  const cityAddNewFields = [
    {
      name: "name",
      label: tCompanies("cityName"),
      placeholder: tCompanies("cityNamePlaceholder"),
    },
    {
      name: "postal_code",
      label: tCompanies("postalCode"),
      placeholder: tCompanies("postalCodePlaceholder"),
    },
  ];

  const onSubmit = (data: CompanyFormInput) => {
    const payload: CompanyServerInput = {
      name: data.name,
      tin: data.tin || null,
      vat: data.vat || null,
      registration_number: data.registration_number || null,
      address: data.address || null,
      city_id: data.city_id || null,
      country_id: data.country_id || null,
      phone: data.phone || null,
      email: data.email || null,
      website: data.website || null,
      type: data.type ?? "company",
      discount_percentage: Number(data.discount_percentage) || 0,
      is_partner: data.is_partner ?? false,
    };

    if (itemToEdit) {
      updateCompany.mutate(
        { formData: payload, companyId: itemToEdit.id },
        { onSuccess: () => onClose() }
      );
    } else {
      createCompany.mutate(payload, { onSuccess: () => onClose() });
    }
  };

  const isPending = createCompany.isPending || updateCompany.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Company Name & Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tCompanies("name")} *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isPending}
                    placeholder={tCompanies("namePlaceholder")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tCompanies("type")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isPending}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={tCompanies("typePlaceholder")}
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {companyTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Business Identifiers Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="tin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tCompanies("tin")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    disabled={isPending}
                    placeholder={tCompanies("tinPlaceholder")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="vat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tCompanies("vat")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    disabled={isPending}
                    placeholder={tCompanies("vatPlaceholder")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="registration_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tCompanies("registrationNumber")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    disabled={isPending}
                    placeholder={tCompanies("registrationNumberPlaceholder")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Contact Info Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tCompanies("phone")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    disabled={isPending}
                    placeholder={tCompanies("phonePlaceholder")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tCompanies("email")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    disabled={isPending}
                    placeholder={tCompanies("emailPlaceholder")}
                    type="email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tCompanies("website")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    disabled={isPending}
                    placeholder={tCompanies("websitePlaceholder")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Address, Country & City */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="country_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tCompanies("country")}</FormLabel>
                <FormControl>
                  <DatabaseSelectVirtualNew
                    options={countryOptions}
                    value={field.value ?? undefined}
                    onChange={(value) => {
                      field.onChange(value);
                      // Reset city when country changes
                      form.setValue("city_id", null);
                    }}
                    onBlur={field.onBlur}
                    placeholder={tCompanies("countryPlaceholder")}
                    isLoading={isLoadingCountries}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="city_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tCompanies("city")}</FormLabel>
                <FormControl>
                  <DatabaseSelectVirtualNew
                    options={cityOptions}
                    value={field.value ?? undefined}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    placeholder={tCompanies("cityPlaceholder")}
                    isLoading={isLoadingCities}
                    disabled={isPending || !watchedCountryId}
                    disabledTooltip={tCompanies("cityDisabledTooltip")}
                    allowAddNew={true}
                    addNewPlaceholder={tCommon("addButton")}
                    addNewFields={cityAddNewFields}
                    onInsert={insertCity}
                    isInserting={isInsertingCity}
                    insertContext={{
                      country_id: watchedCountryId ?? undefined,
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tCompanies("address")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    disabled={isPending}
                    placeholder={tCompanies("addressPlaceholder")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Partner & Discount Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="is_partner"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>{tCompanies("partner")}</FormLabel>
                  <FormDescription className="text-xs">
                    {tCompanies("partnerDescription")}
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
            name="discount_percentage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tCompanies("discountPercentage")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={Number(field.value) || 0}
                    type="number"
                    min={0}
                    max={100}
                    step={0.01}
                    disabled={isPending || !watchedIsPartner}
                  />
                </FormControl>
                <FormMessage />
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
          <Button type="submit" disabled={!form.formState.isDirty || isPending}>
            {isPending ? tProgress("saving") : tCommon("saveButton")}
          </Button>
        </div>
      </form>
    </Form>
  );
}

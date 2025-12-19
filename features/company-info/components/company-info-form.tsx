"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";

import {
  CompanyInfoFormSchema,
  CompanyInfoFormInput,
  CompanyInfoServerInput,
} from "../schemas/company-info-schema";
import { useCompanyInfoMutation } from "../hooks/use-company-info";
import { CompanyInfoTypeDb } from "@/types/data-models";
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface CompanyInfoFormProps {
  companyInfo: CompanyInfoTypeDb["Row"] | null;
  onClose: () => void;
}

export function CompanyInfoForm({
  companyInfo,
  onClose,
}: CompanyInfoFormProps) {
  const t = useTranslations("CompanyInfo.Validation");
  const tForm = useTranslations("CompanyInfo");
  const tCommon = useTranslations("Common.Buttons");
  const tProgress = useTranslations("Common.Progress");

  const { updateCompanyInfo, isPending } = useCompanyInfoMutation();

  // Country and City hooks
  const { countryOptions, isLoadingCountries } = useCountryOptions();

  const form = useForm<CompanyInfoFormInput>({
    resolver: zodResolver(CompanyInfoFormSchema(t)),
    defaultValues: {
      name: companyInfo?.name ?? "",
      tin: companyInfo?.tin ?? "",
      vat: companyInfo?.vat ?? "",
      registration_number: companyInfo?.registration_number ?? "",
      address: companyInfo?.address ?? "",
      city_id: companyInfo?.city_id ?? null,
      country_id: companyInfo?.country_id ?? null,
      phone: companyInfo?.phone ?? "",
      email: companyInfo?.email ?? "",
      website: companyInfo?.website ?? "",
      description: companyInfo?.description ?? "",
    },
  });

  const watchedCountryId = form.watch("country_id");
  const { cityOptions, isLoadingCities } = useCityOptions(watchedCountryId);
  const { insertCity, isInsertingCity } = useCityMutation();

  const cityAddNewFields = [
    {
      name: "name",
      label: tForm("cityName"),
      placeholder: tForm("cityNamePlaceholder"),
    },
    {
      name: "postal_code",
      label: tForm("postalCode"),
      placeholder: tForm("postalCodePlaceholder"),
    },
  ];

  const onSubmit = (data: CompanyInfoFormInput) => {
    const payload: CompanyInfoServerInput = {
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
      description: data.description || null,
    };

    updateCompanyInfo.mutate(payload, {
      onSuccess: () => onClose(),
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Company Name & Description */}
        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tForm("name")} *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
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
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tForm("description")}</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    value={field.value ?? ""}
                    disabled={isPending}
                    placeholder={tForm("descriptionPlaceholder")}
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Business Identifiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="tin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tForm("tin")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    disabled={isPending}
                    placeholder={tForm("tinPlaceholder")}
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
                <FormLabel>{tForm("vat")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    disabled={isPending}
                    placeholder={tForm("vatPlaceholder")}
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
                <FormLabel>{tForm("registrationNumber")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    disabled={isPending}
                    placeholder={tForm("registrationNumberPlaceholder")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tForm("phone")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    disabled={isPending}
                    placeholder={tForm("phonePlaceholder")}
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
                <FormLabel>{tForm("email")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    disabled={isPending}
                    placeholder={tForm("emailPlaceholder")}
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
                <FormLabel>{tForm("website")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    disabled={isPending}
                    placeholder={tForm("websitePlaceholder")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Location */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="country_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tForm("country")}</FormLabel>
                <FormControl>
                  <DatabaseSelectVirtualNew
                    options={countryOptions}
                    value={field.value ?? undefined}
                    onChange={(value) => {
                      field.onChange(value);
                      form.setValue("city_id", null);
                    }}
                    onBlur={field.onBlur}
                    placeholder={tForm("countryPlaceholder")}
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
                <FormLabel>{tForm("city")}</FormLabel>
                <FormControl>
                  <DatabaseSelectVirtualNew
                    options={cityOptions}
                    value={field.value ?? undefined}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    placeholder={tForm("cityPlaceholder")}
                    isLoading={isLoadingCities}
                    disabled={isPending || !watchedCountryId}
                    disabledTooltip={tForm("cityDisabledTooltip")}
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
                <FormLabel>{tForm("address")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    disabled={isPending}
                    placeholder={tForm("addressPlaceholder")}
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

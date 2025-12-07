"use client";

import { TableSearchInput } from "@/components/table-search-input";
import { useTranslations } from "next-intl";
import { usePatientTableFilters } from "../hooks/use-patient-table-filters";

export default function PatientSearchBar() {
  const t = useTranslations("Patient");
  const {
    firstNameQuery,
    setFirstNameQuery,
    lastNameQuery,
    setLastNameQuery,
    nationalIdQuery,
    setNationalIdQuery,
    phoneQuery,
    setPhoneQuery,
  } = usePatientTableFilters();

  return (
    <>
      <TableSearchInput
        placeholder={t("searchFirstName")}
        searchQuery={firstNameQuery}
        setSearchQuery={setFirstNameQuery}
      />
      <TableSearchInput
        placeholder={t("searchLastName")}
        searchQuery={lastNameQuery}
        setSearchQuery={setLastNameQuery}
      />
      <TableSearchInput
        placeholder={t("searchNationalId")}
        searchQuery={nationalIdQuery}
        setSearchQuery={setNationalIdQuery}
      />
      <TableSearchInput
        placeholder={t("searchPhone")}
        searchQuery={phoneQuery}
        setSearchQuery={setPhoneQuery}
      />
    </>
  );
}

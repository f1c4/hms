"use client";

import { TableSearchInput } from "@/components/table-search-input";
import { useTranslations } from "next-intl";
import { usePatientTableFilters } from "../hooks/use-patient-table-filters";

const MIN_SEARCH_CHARS = 2;

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
        minChars={MIN_SEARCH_CHARS}
      />
      <TableSearchInput
        placeholder={t("searchLastName")}
        searchQuery={lastNameQuery}
        setSearchQuery={setLastNameQuery}
        minChars={MIN_SEARCH_CHARS}
      />
      <TableSearchInput
        placeholder={t("searchNationalId")}
        searchQuery={nationalIdQuery}
        setSearchQuery={setNationalIdQuery}
        minChars={MIN_SEARCH_CHARS}
      />
      <TableSearchInput
        placeholder={t("searchPhone")}
        searchQuery={phoneQuery}
        setSearchQuery={setPhoneQuery}
        minChars={MIN_SEARCH_CHARS}
      />
    </>
  );
}

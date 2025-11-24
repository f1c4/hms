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
    uidQuery,
    setUidQuery,
    documentQuery,
    setDocumentQuery,
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
        placeholder={t("searchUID")}
        searchQuery={uidQuery}
        setSearchQuery={setUidQuery}
      />
      <TableSearchInput
        placeholder={t("searchDocument")}
        searchQuery={documentQuery}
        setSearchQuery={setDocumentQuery}
      />
    </>
  );
}

"use client";

import { searchParams } from "@/utils/search-params/searchparams";
import { useQueryState } from "nuqs";
import { useCallback, useMemo } from "react";

export function usePatientTableFilters() {
  const [firstNameQuery, setFirstNameQuery] = useQueryState(
    "firstName",
    searchParams.firstName
  );
  const [lastNameQuery, setLastNameQuery] = useQueryState(
    "lastName",
    searchParams.lastName
  );
  const [uidQuery, setUidQuery] = useQueryState("uid", searchParams.uid);
  const [documentQuery, setDocumentQuery] = useQueryState(
    "document",
    searchParams.document
  );

  const resetFilters = useCallback(() => {
    setFirstNameQuery("");
    setLastNameQuery("");
    setUidQuery("");
    setDocumentQuery("");
  }, [

    setFirstNameQuery,
    setUidQuery,
    setDocumentQuery,
    setLastNameQuery,
  ]);

  const isFilterActive = useMemo(() => {
    return Boolean(firstNameQuery?.length || lastNameQuery?.length || uidQuery?.length || documentQuery?.length);
  }, [firstNameQuery, lastNameQuery, uidQuery, documentQuery]);

  return {
    firstNameQuery,
    setFirstNameQuery,
    lastNameQuery,
    setLastNameQuery,
    uidQuery,
    setUidQuery,
    documentQuery,
    setDocumentQuery,
    resetFilters,
    isFilterActive,
  };
}

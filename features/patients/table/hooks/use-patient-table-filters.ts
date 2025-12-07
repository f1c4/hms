"use client";

import { searchParams } from "@/utils/search-params/searchparams";
import { useQueryStates } from "nuqs";
import { useCallback, useMemo, useTransition } from "react";

export function usePatientTableFilters() {
  const [isPending, startTransition] = useTransition();

  const [filters, setFilters] = useQueryStates(
    {
      firstName: searchParams.firstName,
      lastName: searchParams.lastName,
      nationalId: searchParams.nationalId,
      phone: searchParams.phone,
      page: searchParams.page,
    },
    {
      startTransition,
    },
  );

  // Individual setters that reset page to 1
  const setFirstNameQuery = useCallback(
    (value: string) => {
      setFilters({ firstName: value, page: 1 });
    },
    [setFilters],
  );

  const setLastNameQuery = useCallback(
    (value: string) => {
      setFilters({ lastName: value, page: 1 });
    },
    [setFilters],
  );

  const setNationalIdQuery = useCallback(
    (value: string) => {
      setFilters({ nationalId: value, page: 1 });
    },
    [setFilters],
  );

  const setPhoneQuery = useCallback(
    (value: string) => {
      setFilters({ phone: value, page: 1 });
    },
    [setFilters],
  );

  const resetFilters = useCallback(() => {
    setFilters({
      firstName: "",
      lastName: "",
      nationalId: "",
      phone: "",
      page: 1,
    });
  }, [setFilters]);

  const isFilterActive = useMemo(() => {
    return Boolean(
      filters.firstName ||
        filters.lastName ||
        filters.nationalId ||
        filters.phone,
    );
  }, [filters]);

  return {
    // Filter values
    firstNameQuery: filters.firstName,
    lastNameQuery: filters.lastName,
    nationalIdQuery: filters.nationalId,
    phoneQuery: filters.phone,

    // Setters (auto-reset page to 1)
    setFirstNameQuery,
    setLastNameQuery,
    setNationalIdQuery,
    setPhoneQuery,

    // Utilities
    resetFilters,
    isFilterActive,
    isPending,
  };
}

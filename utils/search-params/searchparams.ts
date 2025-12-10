import {
  createSearchParamsCache,
  createSerializer,
  parseAsInteger,
  parseAsString,
} from "nuqs/server";

export const searchParams = {
  // ============================================================================
  // Global Table Parameters (used across all tables)
  // ============================================================================
  page: parseAsInteger.withDefault(1).withOptions({
    shallow: false,
    clearOnDefault: true,
  }),
  limit: parseAsInteger.withDefault(20).withOptions({
    shallow: false,
    clearOnDefault: true,
  }),
  sort: parseAsString.withDefault("created_at").withOptions({
    shallow: false,
    clearOnDefault: true,
  }),
  order: parseAsString.withDefault("desc").withOptions({
    shallow: false,
    clearOnDefault: true,
  }),

  // ============================================================================
  // Patient Basic Search Filters (matches RPC: get_patient_list_basic)
  // Increased throttle to 400ms for better debouncing with min char validation
  // ============================================================================
  firstName: parseAsString.withDefault("").withOptions({
    shallow: false,
    clearOnDefault: true,
    throttleMs: 400,
  }),
  lastName: parseAsString.withDefault("").withOptions({
    shallow: false,
    clearOnDefault: true,
    throttleMs: 400,
  }),
  nationalId: parseAsString.withDefault("").withOptions({
    shallow: false,
    clearOnDefault: true,
    throttleMs: 400,
  }),
  phone: parseAsString.withDefault("").withOptions({
    shallow: false,
    clearOnDefault: true,
    throttleMs: 400,
  }),
};

export const searchParamsCache = createSearchParamsCache(searchParams);
export const serialize = createSerializer(searchParams);

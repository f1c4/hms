import {
  createSearchParamsCache,
  createSerializer,
  parseAsInteger,
  parseAsString,
} from "nuqs/server";

export const searchParams = {

  // Table pagination and sorting
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
    clearOnDefault: false,
  }),
  order: parseAsString.withDefault("desc").withOptions({
    shallow: false,
    clearOnDefault: false,
  }),
  offset: parseAsInteger.withDefault(0).withOptions({
    shallow: false,
    clearOnDefault: false,
  }),

  // Search filters
  search: parseAsString.withDefault("").withOptions({
    shallow: false,
    clearOnDefault: true,
    throttleMs: 500,
  }),

  // Patient-specific filters
  firstName: parseAsString.withDefault("").withOptions({
    shallow: false,
    clearOnDefault: true,
    throttleMs: 500,
  }),
  lastName: parseAsString.withDefault("").withOptions({
    shallow: false,
    clearOnDefault: true,
    throttleMs: 500,
  }),
  uid: parseAsString.withDefault("").withOptions({
    shallow: false,
    clearOnDefault: true,
    throttleMs: 500,
  }),
  document: parseAsString.withDefault("").withOptions({
    shallow: false,
    clearOnDefault: true,
    throttleMs: 500,
  }),

  // Additional parameters for specific views or modes
  mode: parseAsString.withDefault("view").withOptions({
    shallow: true,
    clearOnDefault: false,
  }),
  tab: parseAsString.withDefault("general").withOptions({
    shallow: true,
    clearOnDefault: false,
  }),
};

export const searchParamsCache = createSearchParamsCache(searchParams);
export const serialize = createSerializer(searchParams);

"use client";

import { Button } from "../../../components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMemo, useState, useEffect } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { getMKB10Data } from "../actions/mkb-10-actions";
import { useMKB10Columns } from "../hooks/use-mkb10-table-columns";
import { SortingState } from "@tanstack/react-table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DataTableVirtualized } from "@/components/table/data-table-virtualized";
import { useMKB10FormFields } from "../hooks/use-mkb10-form-fields";
import { MKB10FormSchema, MKB10FormType } from "@/schemas/form-schemas";
import { useTranslations } from "next-intl";

export default function Mkb10() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchFilters, setSearchFilters] = useState<MKB10FormType>({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const formFields = useMKB10FormFields();
  const queryClient = useQueryClient();
  const columns = useMKB10Columns();
  const tSection = useTranslations("Components.MKB10");
  const tCommon = useTranslations("Common.Buttons");

  const form = useForm<MKB10FormType>({
    resolver: zodResolver(MKB10FormSchema),
    defaultValues: {
      groupName: "",
      code: "",
      diagnosisSr: "",
      diagnosisLat: "",
    },
    mode: "onSubmit",
  });

  function onSubmit(data: MKB10FormType) {
    const filteredValues = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== "")
    );

    // Clear previous search results to avoid memory buildup
    queryClient.removeQueries({
      queryKey: ["mkb10"],
      exact: false,
    });

    setSearchFilters(filteredValues);
    setSorting([]); // Reset sorting when searching
  }

  const {
    data: mkb10Data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["mkb10", searchFilters],
    queryFn: ({ pageParam = 1 }) =>
      getMKB10Data({
        page: pageParam,
        limit: 50,
        code: searchFilters.code || "",
        diagnosisSR: searchFilters.diagnosisSr || "", // Map diagnosisSr to diagnosisSR
        diagnosisLat: searchFilters.diagnosisLat || "",
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.success || !lastPage.data) return undefined;

      const totalItems = lastPage.data.totalCount.data || 0;
      const currentlyLoadedItems = allPages.reduce((total, page) => {
        return (
          total + (page.success && page.data ? page.data.MKBdata.length : 0)
        );
      }, 0);

      return currentlyLoadedItems < totalItems
        ? allPages.length + 1
        : undefined;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    enabled: isOpen, // Only fetch when sheet is open
    gcTime: 1000 * 60 * 5, // 5 minutes
  });

  // Flatten all pages data into a single array with memoization
  const flatData = useMemo(() => {
    return (
      mkb10Data?.pages?.flatMap((page) =>
        page.success && page.data ? page.data.MKBdata : []
      ) || []
    );
  }, [mkb10Data?.pages]);

  // Memoize total items calculation
  const totalItems = useMemo(() => {
    return mkb10Data?.pages?.[0]?.success && mkb10Data?.pages?.[0]?.data
      ? mkb10Data.pages[0].data.totalCount.data || 0
      : 0;
  }, [mkb10Data?.pages]);

  // Calculate loaded items using the same logic as getNextPageParam
  const loadedItems = useMemo(() => {
    if (!mkb10Data?.pages) return 0;

    return mkb10Data.pages.reduce((total, page) => {
      return total + (page.success && page.data ? page.data.MKBdata.length : 0);
    }, 0);
  }, [mkb10Data?.pages]);

  const clearFilters = () => {
    form.reset();
    setSearchFilters({});
    setSorting([]);

    // Clear any existing query cache for search results to ensure fresh data
    queryClient.removeQueries({
      queryKey: ["mkb10"],
      exact: false,
    });
  };

  const handleSortingChange = (
    updaterOrValue: SortingState | ((old: SortingState) => SortingState)
  ) => {
    const newSorting =
      typeof updaterOrValue === "function"
        ? updaterOrValue(sorting)
        : updaterOrValue;
    setSorting(newSorting);
  };

  const handleSheetClose = (open: boolean) => {
    // If closing the sheet (open = false)
    if (!open) {
      // If we have more than 1 page of data (meaning more than 50 entries), reset to first page only
      if (mkb10Data?.pages && mkb10Data.pages.length > 1) {
        console.log(
          `Resetting cache from ${mkb10Data.pages.length} pages to 1 page (${flatData.length} -> 50 entries)`
        );

        // Keep only the first page of data to reduce memory usage
        const firstPageData = mkb10Data.pages[0];

        // Reset the query data to only the first page
        queryClient.setQueryData(["mkb10", searchFilters], {
          pages: [firstPageData],
          pageParams: [1],
        });
      }
    }

    setIsOpen(open);
  };

  // Use effect to handle sheet state changes
  useEffect(() => {
    // Reset sorting when sheet opens
    if (isOpen) {
      setSorting([]);
    }
  }, [isOpen]);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="hidden md:inline-flex h-8"
      >
        {tSection("title")}
      </Button>
      <Sheet open={isOpen} onOpenChange={handleSheetClose}>
        <SheetContent
          className={"w-full md:min-w-2/3 flex flex-col px-4"}
          side="right"
        >
          <SheetHeader className="space-y-0 px-0">
            <SheetTitle className="text-2xl">{tSection("title")}</SheetTitle>
            <SheetDescription>{tSection("description")}</SheetDescription>
          </SheetHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex gap-4 items-center w-full"
            >
              {formFields.map((field) => (
                <FormField
                  key={field.name}
                  control={form.control}
                  name={field.name as keyof MKB10FormType}
                  render={({ field: formField }) => (
                    <FormItem>
                      <FormLabel>{field.label}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={field.placeholder}
                          {...formField}
                          type={field.type}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
              <div className="flex gap-2 self-baseline-last">
                <Button type="submit">{tCommon("searchButton")}</Button>
                <Button type="button" variant="outline" onClick={clearFilters}>
                  {tCommon("clearButton")}
                </Button>
              </div>
            </form>
          </Form>
          <DataTableVirtualized
            key="mkb10-table"
            columns={columns}
            data={flatData}
            totalItems={totalItems}
            loadedItems={loadedItems}
            isLoading={isLoading}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            fetchNextPage={fetchNextPage}
            sorting={sorting}
            onSortingChange={handleSortingChange}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}

"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { Options } from "nuqs";
import { useTransition } from "react";

interface DataTableSearchProps {
  searchQuery: string;
  setSearchQuery: (value: string, options: Options) => void;
  placeholder?: string;
  minChars?: number;
}

export function TableSearchInput({
  searchQuery,
  setSearchQuery,
  placeholder,
  minChars = 2,
}: DataTableSearchProps) {
  const [isLoading, startTransition] = useTransition();
  const t = useTranslations("Components.TableSearch");

  const handleSearch = (value: string) => {
    setSearchQuery(value, { startTransition });
  };

  const handleReset = () => {
    setSearchQuery("", { startTransition });
  };

  const isFilteringActive = searchQuery.length > 0;
  const isBelowMinChars =
    searchQuery.length > 0 && searchQuery.length < minChars;
  const remainingChars = minChars - searchQuery.length;

  return (
    <div className="relative w-full md:max-w-sm">
      <Input
        placeholder={placeholder ?? `Search...`}
        value={searchQuery ?? ""}
        onChange={(e) => handleSearch(e.target.value)}
        className={cn(
          "w-full pr-10",
          isLoading && "animate-pulse",
          isBelowMinChars && "border-amber-400 focus-visible:ring-amber-400"
        )}
      />
      {isBelowMinChars && (
        <span className="absolute -bottom-5 left-0 text-xs text-amber-600">
          {t("minCharsHint", { count: remainingChars })}
        </span>
      )}
      {isFilteringActive && (
        <button
          type="button"
          onClick={handleReset}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      )}
    </div>
  );
}

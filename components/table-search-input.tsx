"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Options } from "nuqs";
import { useTransition } from "react";

interface DataTableSearchProps {
  searchQuery: string;
  setSearchQuery: (value: string, options: Options) => void;
  placeholder?: string;
}

export function TableSearchInput({
  searchQuery,
  setSearchQuery,
  placeholder,
}: DataTableSearchProps) {
  const [isLoading, startTransition] = useTransition();

  const handleSearch = (value: string) => {
    setSearchQuery(value, { startTransition });
  };

  const handleReset = () => {
    setSearchQuery("", { startTransition });
  };

  const isFilteringActive = searchQuery.length > 0;

  return (
    <div className="relative w-full md:max-w-sm">
      <Input
        placeholder={placeholder ?? `Search...`}
        value={searchQuery ?? ""}
        onChange={(e) => handleSearch(e.target.value)}
        className={cn("w-full pr-10", isLoading && "animate-pulse")}
      />
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

"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronsUpDown, XIcon } from "lucide-react";
import { MkbSearchResult, searchMkb10 } from "../../actions/idc-search";
import { cn } from "@/lib/utils";

// Define the object structure for a selected diagnosis
export interface DiagnosisValue {
  value: string;
  label: string;
}

// Update the component's props to use the new type
interface DiagnosisSelectorProps {
  value: DiagnosisValue[] | undefined;
  onChange: (value: DiagnosisValue[]) => void;
  disabled?: boolean;
}

export function DiagnosisSelector({
  value: selectedItems = [], // Rename for clarity
  onChange,
  disabled,
}: DiagnosisSelectorProps) {
  const locale = useLocale();
  const t = useTranslations("Patient.MedicalHistory.Form");
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<MkbSearchResult[]>(
    []
  );
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    const handler = setTimeout(async () => {
      if (searchQuery.length > 1) {
        setIsLoading(true);
        const results = await searchMkb10(searchQuery);
        setSearchResults(results);
        setIsLoading(false);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const getDiagnosisName = (item: MkbSearchResult) => {
    const translations = item.diagnosis_translations as Record<string, string>;
    return translations?.[locale] ?? translations?.["en"] ?? "Unknown";
  };

  const handleSelect = (item: MkbSearchResult) => {
    // Check if the item is already selected by its value (code)
    if (!selectedItems.some((selected) => selected.value === item.code)) {
      // Add the new item as an object
      onChange([
        ...selectedItems,
        { value: item.code, label: getDiagnosisName(item) },
      ]);
    }
    setSearchQuery("");
    setOpen(false);
  };

  const handleRemove = (code: string) => {
    // Filter out the item by its value (code)
    onChange(selectedItems.filter((item) => item.value !== code));
  };

  const isSelected = (code: string) => {
    return selectedItems.some((item) => item.value === code);
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
            disabled={disabled}
          >
            <span className="truncate">
              {selectedItems.length > 0
                ? t("diagnosesSelected", { count: selectedItems.length })
                : t("diagnosesPlaceholder")}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={t("diagnosesSearchPlaceholder")}
              value={searchQuery}
              onValueChange={setSearchQuery}
              disabled={disabled}
            />
            <CommandList>
              {isLoading && (
                <CommandEmpty>{t("diagnosesLoading")}</CommandEmpty>
              )}
              {!isLoading &&
                searchResults.length === 0 &&
                searchQuery.length > 1 && (
                  <CommandEmpty>{t("diagnosesNoResults")}</CommandEmpty>
                )}
              <CommandGroup>
                {searchResults.map((item) => (
                  <CommandItem
                    key={item.code}
                    value={item.code}
                    onSelect={() => handleSelect(item)}
                    disabled={isSelected(item.code)}
                    className={cn(
                      isSelected(item.code) && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {item.code} - {getDiagnosisName(item)}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Display selected diagnoses as badges */}
      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-muted/50">
          {selectedItems.map((item) => (
            <Badge key={item.value} variant="secondary">
              {item.label} ({item.value})
              <button
                type="button"
                onClick={() => handleRemove(item.value)}
                className="ml-1.5 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                disabled={disabled}
              >
                <XIcon className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

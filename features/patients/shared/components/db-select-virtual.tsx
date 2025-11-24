"use client";

// CORRECTED: Import the 'X' icon
import { Check, ChevronsUpDown, PlusCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useVirtualizer } from "@tanstack/react-virtual";
import React, { forwardRef, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface ComboboxOption {
  value: number | string;
  label: string;
}

export interface AddNewField {
  name: string;
  label: string;
  placeholder: string;
}

type DataValue = string | number | boolean | null;

interface ComboboxProps<TInsertData extends Record<string, DataValue>> {
  options: ComboboxOption[];
  value?: number | string;
  onChange: (value: number | string | undefined) => void;
  onBlur: () => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyPlaceholder?: string;
  isLoading?: boolean;
  disabled?: boolean;
  disabledTooltip?: string;
  allowAddNew?: boolean;
  addNewFields?: AddNewField[];
  onInsert?: (data: TInsertData) => void;
  isInserting?: boolean;
  insertContext?: Partial<TInsertData>;
}

function DatabaseSelectVirtualInner<
  TInsertData extends Record<string, DataValue>
>(
  {
    options,
    value,
    onChange,
    onBlur,
    placeholder = "Select an option...",
    searchPlaceholder = "Search...",
    emptyPlaceholder = "No results found.",
    isLoading = false,
    disabled = false,
    disabledTooltip,
    allowAddNew = false,
    addNewFields = [],
    onInsert,
    isInserting = false,
    insertContext = {},
  }: ComboboxProps<TInsertData>,
  ref: React.Ref<HTMLButtonElement>
) {
  const [open, setOpen] = useState(false);
  const [addPopoverOpen, setAddPopoverOpen] = useState(false);
  const [newOptionData, setNewOptionData] = useState<Record<string, string>>(
    {}
  );
  const [search, setSearch] = useState("");

  const filteredOptions = useMemo(
    () =>
      options.filter((option) =>
        option.label.toLowerCase().includes(search.toLowerCase())
      ),
    [options, search]
  );

  const selectedOption = options.find((option) => option.value === value);

  const parentRef = React.useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: filteredOptions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 32,
    overscan: 5,
  });

  React.useEffect(() => {
    if (open) {
      setSearch("");
      const timeout = setTimeout(() => {
        virtualizer.measure();
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [open, virtualizer]);

  const handleAddNew = () => {
    if (!onInsert || isInserting) return;

    for (const field of addNewFields) {
      if (!newOptionData[field.name]) {
        console.error(`Field '${field.label}' is required.`);
        return;
      }
    }

    const dataToInsert = { ...newOptionData, ...insertContext } as TInsertData;
    onInsert(dataToInsert);
    setAddPopoverOpen(false);
    setNewOptionData({});
  };

  if (disabled && disabledTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-full">
              <Button
                ref={ref}
                variant="outline"
                className="w-full justify-between"
                disabled={true}
                aria-disabled="true"
                tabIndex={-1}
              >
                <span className="truncate">
                  {selectedOption?.label ?? placeholder}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{disabledTooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={ref}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={isLoading}
          onBlur={onBlur}
        >
          <span className="truncate">
            {isLoading ? "Loading..." : selectedOption?.label ?? placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            value={search}
            onValueChange={setSearch}
            placeholder={searchPlaceholder}
          />
          <CommandList ref={parentRef}>
            {filteredOptions.length === 0 && !isLoading && (
              <CommandEmpty>{emptyPlaceholder}</CommandEmpty>
            )}
            <CommandGroup>
              <div
                style={{
                  height: `${virtualizer.getTotalSize()}px`,
                  width: "100%",
                  position: "relative",
                }}
              >
                {virtualizer.getVirtualItems().map((virtualItem) => {
                  const option = filteredOptions[virtualItem.index];
                  return (
                    <CommandItem
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: `${virtualItem.size}px`,
                        transform: `translateY(${virtualItem.start}px)`,
                      }}
                      key={option.value}
                      value={option.label}
                      onSelect={() => {
                        onChange(
                          option.value === value ? undefined : option.value
                        );
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === option.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  );
                })}
              </div>
            </CommandGroup>
            {allowAddNew && (
              <CommandGroup>
                <Popover open={addPopoverOpen} onOpenChange={setAddPopoverOpen}>
                  <PopoverTrigger asChild>
                    <CommandItem
                      onSelect={() => {
                        setAddPopoverOpen(true);
                      }}
                      className="text-primary cursor-pointer"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add new...
                    </CommandItem>
                  </PopoverTrigger>
                  <PopoverContent
                    side="bottom"
                    align="start"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    className="p-4 w-auto"
                  >
                    <div className="grid gap-4 relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-0 right-0 -mt-2 -mr-2 h-6 w-6 p-0"
                        onClick={() => setAddPopoverOpen(false)}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                      </Button>
                      <h4 className="font-medium leading-none">
                        Add New Entry
                      </h4>
                      {addNewFields.map((field) => (
                        <div key={field.name} className="grid gap-2">
                          <Label htmlFor={field.name}>{field.label}</Label>
                          <Input
                            id={field.name}
                            placeholder={field.placeholder}
                            value={newOptionData[field.name] || ""}
                            onChange={(e) =>
                              setNewOptionData((prev) => ({
                                ...prev,
                                [field.name]: e.target.value,
                              }))
                            }
                          />
                        </div>
                      ))}
                      <Button onClick={handleAddNew} disabled={isInserting}>
                        {isInserting ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export const DatabaseSelectVirtualNew = forwardRef(
  DatabaseSelectVirtualInner
) as <TInsertData extends Record<string, DataValue>>(
  props: ComboboxProps<TInsertData> & { ref?: React.Ref<HTMLButtonElement> }
) => React.ReactElement;

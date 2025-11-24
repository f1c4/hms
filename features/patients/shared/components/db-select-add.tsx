"use client";

import * as React from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface ComboboxOption {
  value: number;
  label: string;
}

export interface AddNewField {
  name: string;
  label: string;
  placeholder: string;
}

type DataValue = string | number | boolean | null | Record<string, string>;

interface ComboboxProps<TInsertData extends Record<string, DataValue>> {
  options: ComboboxOption[];
  value?: number;
  onChange: (value: number | undefined) => void;
  onBlur: () => void;
  id?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyPlaceholder?: string;
  isLoading?: boolean;
  disabled?: boolean;
  allowAddNew?: boolean;
  addNewFields?: AddNewField[];
  onInsert?: (data: TInsertData) => void;
  isInserting?: boolean;
  insertContext?: Partial<TInsertData>;
}

export function DatabaseSelectWithAdd<
  TInsertData extends Record<string, DataValue>
>({
  options,
  value,
  onChange,
  onBlur,
  id,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  emptyPlaceholder = "No results found.",
  isLoading = false,
  disabled = false,
  allowAddNew = false,
  addNewFields = [],
  onInsert,
  isInserting = false,
  insertContext = {},
}: ComboboxProps<TInsertData>) {
  const [open, setOpen] = React.useState(false);
  const [addPopoverOpen, setAddPopoverOpen] = React.useState(false);
  const [newOptionData, setNewOptionData] = React.useState<
    Record<string, string>
  >({});

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      onBlur();
    }
  };

  const handleAddNew = () => {
    if (!onInsert || isInserting) return;

    // Basic validation
    for (const field of addNewFields) {
      if (!newOptionData[field.name] || !newOptionData[field.name].trim()) {
        // Here you could add a toast notification for better UX
        console.error(`Field '${field.label}' is required.`);
        return;
      }
    }

    const dataToInsert = { ...newOptionData, ...insertContext } as TInsertData;
    onInsert(dataToInsert);
    setAddPopoverOpen(false);
    setNewOptionData({});
  };

  const selectedOption = options.find((option) => option.value === value);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled || isLoading}
          onBlur={onBlur}
          id={id}
        >
          <span className="truncate">
            {isLoading ? "Loading..." : selectedOption?.label ?? placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyPlaceholder}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    onChange(option.value === value ? undefined : option.value);
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
              ))}
            </CommandGroup>
            {allowAddNew && (
              <CommandGroup>
                <Popover open={addPopoverOpen} onOpenChange={setAddPopoverOpen}>
                  <PopoverTrigger asChild>
                    <CommandItem
                      onSelect={() => setAddPopoverOpen(true)}
                      className="text-primary cursor-pointer"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add new...
                    </CommandItem>
                  </PopoverTrigger>
                  <PopoverContent
                    side="right"
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

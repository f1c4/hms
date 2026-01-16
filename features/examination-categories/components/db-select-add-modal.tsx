"use client";

import * as React from "react";
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react";
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

export interface ComboboxOption {
  value: number;
  label: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value?: number | null;
  onChange: (value: number | null | undefined) => void;
  onBlur: () => void;
  id?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyPlaceholder?: string;
  isLoading?: boolean;
  disabled?: boolean;
  allowAddNew?: boolean;
  onAddNew?: () => void; // Callback to open modal instead of inline form
  addNewLabel?: string;
}

export function DatabaseSelectAddModal({
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
  onAddNew,
  addNewLabel = "Add new...",
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      onBlur();
    }
  };

  const handleAddNewClick = () => {
    setOpen(false); // Close the combobox
    onAddNew?.(); // Trigger the modal
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
                    // Allow clearing selection by clicking the same option
                    onChange(option.value === value ? null : option.value);
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
            {allowAddNew && onAddNew && (
              <CommandGroup>
                <CommandItem
                  onSelect={handleAddNewClick}
                  className="text-primary cursor-pointer"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {addNewLabel}
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

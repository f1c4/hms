"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
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
  value?: number;
  onChange: (value: number) => void;
  onBlur: () => void;
  placeholder?: string;
  emptyPlaceholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
  id?: string;
}

export function DatabaseSelect(props: ComboboxProps) {
  const {
    options,
    value,
    onChange,
    onBlur,
    placeholder = "Select an option...",
    disabled,
    isLoading,
    emptyPlaceholder,
    id,
  } = props;

  const [open, setOpen] = React.useState(false);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      onBlur();
    }
  };

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
        >
          {isLoading
            ? "Loading..."
            : value
            ? options.find((option) => option.value === value)?.label
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
        <Command id={id}>
          <CommandInput placeholder="Search..." />
          <CommandEmpty>{emptyPlaceholder}</CommandEmpty>
          <CommandGroup>
            {options.map((option) => (
              <CommandItem
                key={option.value}
                value={option.label}
                onSelect={() => {
                  onChange(option.value);
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
        </Command>
      </PopoverContent>
    </Popover>
  );
}

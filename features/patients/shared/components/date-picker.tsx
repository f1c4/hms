"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  value?: Date;
  onChange: (value?: Date) => void;
  disabled?: boolean;
  placeholder?: string;
  disableDirection?: "past" | "future" | "none";
  startMonth?: Date;
  endMonth?: Date;
  id?: string;
}

export function DatePicker({
  value,
  onChange,
  disabled,
  placeholder,
  disableDirection = "future",
  startMonth = new Date(1900, 0),
  endMonth = new Date(new Date().getFullYear(), 11),
  id,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSelect = (selectedDate: Date | undefined) => {
    onChange(selectedDate);
    setIsOpen(false);
  };

  const getDisabledDays = () => {
    if (disableDirection === "past") {
      return { before: new Date() };
    }
    if (disableDirection === "future") {
      return { after: new Date() };
    }
    return undefined;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? (
            format(value, "PPP")
          ) : (
            <span>{placeholder ?? "Pick a date"}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          id={id}
          mode="single"
          selected={value}
          onSelect={handleSelect}
          defaultMonth={value}
          startMonth={startMonth}
          endMonth={endMonth}
          disabled={getDisabledDays()}
          captionLayout="dropdown"
        />
      </PopoverContent>
    </Popover>
  );
}

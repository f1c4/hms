"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface ColorPickerProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const PRESET_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#eab308", // yellow
  "#84cc16", // lime
  "#22c55e", // green
  "#10b981", // emerald
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#0ea5e9", // sky
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#d946ef", // fuchsia
  "#ec4899", // pink
  "#f43f5e", // rose
  "#64748b", // slate
  "#6b7280", // gray
  "#78716c", // stone
];

export function ColorPicker({ value, onChange, disabled }: ColorPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [customColor, setCustomColor] = React.useState(value || "");

  React.useEffect(() => {
    setCustomColor(value || "");
  }, [value]);

  const handlePresetClick = (color: string) => {
    onChange(color);
    setCustomColor(color);
    setOpen(false);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCustomColor(newColor);
    if (/^#[0-9A-Fa-f]{6}$/.test(newColor)) {
      onChange(newColor);
    }
  };

  const handleCustomColorBlur = () => {
    if (/^#[0-9A-Fa-f]{6}$/.test(customColor)) {
      onChange(customColor);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal h-10",
            !value && "text-muted-foreground"
          )}
        >
          <div className="flex items-center gap-2 w-full">
            {value && /^#[0-9A-Fa-f]{6}$/.test(value) ? (
              <>
                <div
                  className="h-5 w-5 rounded border shrink-0"
                  style={{ backgroundColor: value }}
                />
                <span className="flex-1">{value.toUpperCase()}</span>
              </>
            ) : (
              <span className="flex-1">Select color</span>
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="start">
        <div className="space-y-3">
          <div className="space-y-2">
            <p className="text-sm font-medium">Preset Colors</p>
            <div className="grid grid-cols-10 gap-1">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handlePresetClick(color)}
                  className={cn(
                    "h-6 w-6 rounded border-2 transition-all hover:scale-110",
                    value === color
                      ? "border-foreground ring-2 ring-offset-2"
                      : "border-border hover:border-foreground/50"
                  )}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                >
                  {value === color && (
                    <Check className="h-3 w-3 text-white stroke-3" />
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Custom Color</p>
            <div className="flex gap-2">
              <Input
                type="text"
                value={customColor}
                onChange={handleCustomColorChange}
                onBlur={handleCustomColorBlur}
                placeholder="#000000"
                pattern="^#[0-9A-Fa-f]{6}$"
                className="flex-1"
                maxLength={7}
              />
              {customColor && /^#[0-9A-Fa-f]{6}$/.test(customColor) && (
                <div
                  className="h-10 w-10 rounded border shrink-0"
                  style={{ backgroundColor: customColor }}
                />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Enter a hex color code (e.g., #FF5733)
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

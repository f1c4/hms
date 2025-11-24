"use client";

import React, { useMemo } from "react";
import { useFields } from "../hooks/use-info-fields";
import { Separator } from "@/components/ui/separator";

/**
 * A read-only component that displays general patient information grouped into logical sections.
 */
export function GeneralInfoList() {
  const { infoFields } = useFields();

  const groupedFields = useMemo(() => {
    return infoFields.reduce((acc, field) => {
      const group = field.group || "primary";
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(field);
      return acc;
    }, {} as Record<string, typeof infoFields>);
  }, [infoFields]);

  const groupOrder: (keyof typeof groupedFields)[] = [
    "primary",
    "citizenship",
    "residence",
    "emergency",
  ];

  return (
    <div className="space-y-4">
      {groupOrder.map((groupKey) => {
        const groupFields = groupedFields[groupKey];
        if (!groupFields) return null;

        return (
          <React.Fragment key={groupKey}>
            <div className="grid grid-cols-1 gap-x-4 gap-y-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {groupFields.map((field) => (
                <div key={field.name} className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {field.label}
                  </p>
                  <p className="text-base">
                    {field.value ? String(field.value) : <span>—</span>}
                  </p>
                </div>
              ))}
            </div>
            <Separator />
          </React.Fragment>
        );
      })}
    </div>
  );
}

"use client";

import React, { useMemo } from "react";
import { PersonalFieldDefinition } from "../types";
import { Separator } from "@/components/ui/separator";

interface PersonalInfoListProps {
  fields: Omit<PersonalFieldDefinition, "error">[];
}

export function PersonalInfoList({ fields }: PersonalInfoListProps) {
  const groupedFields = useMemo(() => {
    return fields.reduce((acc, field) => {
      const group = field.group || "origin";
      if (!acc[group]) acc[group] = [];
      acc[group].push(field);
      return acc;
    }, {} as Record<string, typeof fields>);
  }, [fields]);

  const groupOrder: (keyof typeof groupedFields)[] = [
    "origin",
    "social",
    "professional",
  ];

  return (
    <div className="space-y-4">
      {groupOrder.map((groupKey) => {
        const groupFields = groupedFields[groupKey];
        if (!groupFields || groupFields.length === 0) return null;

        return (
          <React.Fragment key={groupKey}>
            <div className="grid grid-cols-1 gap-x-4 gap-y-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {groupFields.map((field) => (
                <div key={field.name} className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {field.label}
                  </p>
                  <p className="text-base">{field.value || <span>—</span>}</p>
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

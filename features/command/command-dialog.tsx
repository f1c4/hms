"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  CommandDialog as CommandPrimitive,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface CommandAction {
  id: string;
  label: string;
  shortcut?: string[];
  keywords?: string[];
  section?: string;
  perform: () => void;
  icon?: React.ReactNode;
}

interface CommandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actions: CommandAction[];
}

export function CommandDialog({
  open,
  onOpenChange,
  actions,
}: CommandDialogProps) {
  const t = useTranslations("Components.Kbar");
  const [search, setSearch] = React.useState("");

  // Group actions by section
  const groupedActions = React.useMemo(() => {
    const groups: Record<string, CommandAction[]> = {};

    actions.forEach((action) => {
      const section = action.section || "General";
      if (!groups[section]) {
        groups[section] = [];
      }
      groups[section].push(action);
    });

    return groups;
  }, [actions]);

  const runCommand = React.useCallback(
    (command: () => void) => {
      onOpenChange(false);
      command();
    },
    [onOpenChange]
  );

  return (
    <CommandPrimitive
      open={open}
      onOpenChange={onOpenChange}
      className="rounded-lg border shadow-md"
    >
      <CommandInput
        placeholder={t("portalSearch")}
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {Object.entries(groupedActions).map(([section, sectionActions]) => (
          <CommandGroup key={section} heading={section}>
            {sectionActions.map((action) => (
              <CommandItem
                key={action.id}
                value={action.label}
                keywords={action.keywords}
                onSelect={() => runCommand(action.perform)}
              >
                <div className="flex flex-1 items-center justify-between">
                  <div className="flex items-center gap-2">
                    {action.icon}
                    <span>{action.label}</span>
                  </div>
                  {action.shortcut && action.shortcut.length > 0 && (
                    <div className="flex items-center gap-1">
                      {action.shortcut.map((key, i) => (
                        <kbd
                          key={i}
                          className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandPrimitive>
  );
}

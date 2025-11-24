"use client";

import { InsuranceProviderAdminModel } from "@/types/data-models";
import { ProviderListItem } from "./list-item";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ProviderListProps {
  providers: InsuranceProviderAdminModel[];
  selectedProviderId: number | null;
  onSelectProvider: (id: number) => void;
  onEdit: (provider: InsuranceProviderAdminModel) => void;
  onDelete: (provider: InsuranceProviderAdminModel) => void;
}

export function ProviderList({
  providers,
  selectedProviderId,
  onSelectProvider,
  onEdit,
  onDelete,
}: ProviderListProps) {
  return (
    <div className="space-y-4">
      {providers.length > 0 ? (
        <div className="rounded-md border">
          <ul className="divide-y">
            {providers.map((provider) => (
              <ProviderListItem
                key={provider.id}
                provider={provider}
                isSelected={provider.id === selectedProviderId}
                onSelect={() => onSelectProvider(provider.id)}
                onEdit={() => onEdit(provider)}
                onDelete={() => onDelete(provider)}
              />
            ))}
          </ul>
        </div>
      ) : (
        <Alert>
          <AlertDescription>
            No insurance providers found. Click Add Provider to create one.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

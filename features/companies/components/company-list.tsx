"use client";

import { CompaniesTypeDb } from "@/types/data-models";
import { CompanyListItem } from "./company-list-item";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CompanyListProps {
  companies: CompaniesTypeDb["Row"][];
  selectedCompanyId: number | null;
  onSelectCompany: (id: number) => void;
  onView: (company: CompaniesTypeDb["Row"]) => void;
  onEdit: (company: CompaniesTypeDb["Row"]) => void;
  onDelete: (company: CompaniesTypeDb["Row"]) => void;
  isDisabled?: boolean;
}

export function CompanyList({
  companies,
  selectedCompanyId,
  onSelectCompany,
  onView,
  onEdit,
  onDelete,
  isDisabled = false,
}: CompanyListProps) {
  return (
    <div className="space-y-4">
      {companies.length > 0 ? (
        <div className="rounded-md border">
          <ul className="divide-y">
            {companies.map((company) => (
              <CompanyListItem
                key={company.id}
                company={company}
                isSelected={company.id === selectedCompanyId}
                onSelect={() => onSelectCompany(company.id)}
                onView={() => onView(company)}
                onEdit={() => onEdit(company)}
                onDelete={() => onDelete(company)}
                isDisabled={isDisabled}
              />
            ))}
          </ul>
        </div>
      ) : (
        <Alert>
          <AlertDescription>
            No companies found. Click &quot;Add Company&quot; to create one.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

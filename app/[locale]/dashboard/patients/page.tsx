import PatientTableActionBar from "@/features/patients/table/components/patient-table-action-bar";
import PageContainer from "@/components/layout/page-container";
import PatientTable from "@/features/patients/table/components/patient-table";

import { Heading } from "@/components/heading";
import { SearchParams } from "nuqs";
import {
  searchParamsCache,
  serialize,
} from "@/utils/search-params/searchparams";
import { getTranslations } from "next-intl/server";
import { getPatientCount } from "@/features/patients/table/actions/patient-table-actions";
import { Users } from "lucide-react";
import { Suspense } from "react";
import { DataTableSkeleton } from "@/components/data-table-skeleton";

export const metadata = {
  title: "Vranes HMS",
  description: "Hospital Management System for Vranes Hospital",
};

interface pageProps {
  searchParams: Promise<SearchParams>;
}

export default async function Page({ ...props }: pageProps) {
  const searchParams = await props.searchParams;
  const { data: totalCount } = await getPatientCount();
  const t = await getTranslations("Patient");
  searchParamsCache.parse(searchParams);
  const key = serialize({ ...searchParams });

  return (
    <PageContainer scrollable={false} className="flex-col space-y-4">
      <Heading
        icon={<Users className="h-8 w-8" />}
        title={t("title")}
        description={t("subtitle")}
        number={totalCount ?? 0}
      />
      <PatientTableActionBar />
      <Suspense
        key={key}
        fallback={<DataTableSkeleton rowCount={10} columnCount={4} />}
      >
        <PatientTable />
      </Suspense>
    </PageContainer>
  );
}

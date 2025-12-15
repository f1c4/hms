import PageContainer from "@/components/layout/page-container";
import { Heading } from "@/components/heading";
import { Handshake } from "lucide-react";
import CompaniesTab from "@/features/companies";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { getCompanies } from "@/features/companies/actions/companies-actions";
import { getTranslations } from "next-intl/server";

export default async function CompaniesPage() {
  const queryClient = new QueryClient();
  const t = await getTranslations("Companies");

  await queryClient.prefetchQuery({
    queryKey: ["companies"],
    queryFn: getCompanies,
  });

  return (
    <PageContainer scrollable={false} className="flex-col space-y-4">
      <Heading
        title={t("title")}
        description={t("subtitle")}
        icon={<Handshake className="h-8 w-8" />}
      />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <CompaniesTab />
      </HydrationBoundary>
    </PageContainer>
  );
}

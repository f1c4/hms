import PageContainer from "@/components/layout/page-container";
import { Heading } from "@/components/heading";
import { Building2 } from "lucide-react";
import CompanyInfoTab from "@/features/company-info";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { getCompanyInfo } from "@/features/company-info/actions/company-info-actions";
import { getTranslations } from "next-intl/server";

export default async function CompanyInfoPage() {
  const queryClient = new QueryClient();
  const t = await getTranslations("CompanyInfo");

  // Prefetch the data on the server
  await queryClient.prefetchQuery({
    queryKey: ["company-info"],
    queryFn: getCompanyInfo,
  });

  return (
    <PageContainer scrollable={true}>
      <Heading
        title={t("title")}
        description={t("subtitle")}
        icon={<Building2 className="h-8 w-8" />}
      />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <CompanyInfoTab />
      </HydrationBoundary>
    </PageContainer>
  );
}

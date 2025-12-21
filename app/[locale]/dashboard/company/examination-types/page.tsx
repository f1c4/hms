import PageContainer from "@/components/layout/page-container";
import { Heading } from "@/components/heading";
import { Stethoscope } from "lucide-react";
import ExaminationTypesTab from "@/features/examination-types";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { getExaminationTypes } from "@/features/examination-types/actions/examination-type-actions";
import { getTranslations } from "next-intl/server";

export default async function ExaminationTypesPage() {
  const queryClient = new QueryClient();
  const t = await getTranslations("Examinations");

  // Prefetch the data on the server (include inactive for admin view)
  await queryClient.prefetchQuery({
    queryKey: ["examination-types", { includeInactive: true }],
    queryFn: async () => {
      const result = await getExaminationTypes(true);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
  });

  return (
    <PageContainer scrollable={true}>
      <Heading
        title={t("title")}
        description={t("subtitle")}
        icon={<Stethoscope className="h-8 w-8" />}
      />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ExaminationTypesTab includeInactive={true} />
      </HydrationBoundary>
    </PageContainer>
  );
}

import SystemClient from "@/features/settings/system-client";
import { getFullSystemData } from "@/features/settings/shared/actions/get-full-system-data";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

export default async function SystemDataPage() {
  const queryClient = new QueryClient();

  // Prefetch the data on the server
  await queryClient.prefetchQuery({
    queryKey: ["full-system-data"],
    queryFn: getFullSystemData,
  });

  // Pass the dehydrated query client state to the boundary
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SystemClient />
    </HydrationBoundary>
  );
}

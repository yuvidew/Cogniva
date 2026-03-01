import { DashboardError, DashboardLoading, DashboardView } from "@/features/dashboard/_components/dashboard-view";
import { dashboardParamsLoader } from "@/features/dashboard/server/params-loader";
import { prefetchDashboardData } from "@/features/dashboard/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from 'react-error-boundary';



export default async function Home() {
  await requireAuth();

  await dashboardParamsLoader({});
  prefetchDashboardData();


  return (
    <HydrateClient>
      <ErrorBoundary fallback={<DashboardError/>}>
        <Suspense fallback={<DashboardLoading />}>
          <DashboardView />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
}

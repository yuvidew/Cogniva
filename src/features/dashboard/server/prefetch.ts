
import {prefetch , trpc} from "@/trpc/server";


/**
 * Prefetches the dashboard data to improve performance when the dashboard page is accessed.
 * @returns A promise that resolves when the prefetching is complete. 
 */

export const prefetchDashboardData = () => {
    return prefetch(trpc.dashboard.getStats.queryOptions());
};
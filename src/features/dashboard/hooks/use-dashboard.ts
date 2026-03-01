import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";


/**
 * Hook to fetch dashboard data using TRPC and React Query's suspense mode.
 * This hook will suspend the component until the data is fetched, providing a seamless loading experience.
 * @returns The dashboard statistics data.
 */
export const useSuspenseDashboardData = () => {
    const trpc = useTRPC();

    return useSuspenseQuery(
        trpc.dashboard.getStats.queryOptions()
    );
};
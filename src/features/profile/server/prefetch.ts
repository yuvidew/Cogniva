import { prefetch, trpc } from "@/trpc/server"

/**
 * Prefetches the dashboard data to improve performance when the dashboard page is accessed. 
 */
export const prefetchProfileData = async () => {
    return prefetch(trpc.profile.getUser.queryOptions());
}
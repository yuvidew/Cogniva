import { profileRouter } from "@/features/profile/server/routers";
import { agentRouter } from "@/features/common/server/routers";
import { dashboardRouter } from "@/features/dashboard/server/routers";
import { router } from "@/trpc/init";

export const appRouter  = router({
    profile : profileRouter,
    agent : agentRouter,
    dashboard : dashboardRouter,
});

export type AppRouter = typeof appRouter;
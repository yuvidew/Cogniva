import { profileRouter } from "@/features/profile/server/routers";
import { router } from "@/trpc/init";

export const appRouter  = router({
    profile : profileRouter,
});

export type AppRouter = typeof appRouter;
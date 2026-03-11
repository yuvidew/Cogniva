
import { dashboardRouter } from '@/features/dashboard/server/routers';
import {  createTRPCRouter } from '../init';
import { agentRouter } from '@/features/common/server/routers';
import { agentByIdRouter } from '@/features/agents/server/routers';
import { profileRouter } from '@/features/profile/server/routers';


export const appRouter = createTRPCRouter({
  agent: agentRouter,
  agentById: agentByIdRouter,
  dashboard: dashboardRouter,
  profile: profileRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
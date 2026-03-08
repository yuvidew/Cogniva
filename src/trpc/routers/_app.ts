
import { dashboardRouter } from '@/features/dashboard/server/routers';
import {  createTRPCRouter } from '../init';
import { agentRouter } from '@/features/common/server/routers';
import { agentByIdRouter } from '@/features/agents/server/routers';


export const appRouter = createTRPCRouter({
  agent: agentRouter,
  agentById: agentByIdRouter,
  dashboard: dashboardRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
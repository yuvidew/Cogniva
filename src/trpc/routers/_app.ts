
import { dashboardRouter } from '@/features/dashboard/server/routers';
import {  createTRPCRouter } from '../init';
import { agentRouter } from '@/features/common/server/routers';


export const appRouter = createTRPCRouter({
  agent: agentRouter,
  dashboard: dashboardRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
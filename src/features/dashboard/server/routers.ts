import { createTRPCRouter, premiumProcedure } from "@/trpc/init";
import prisma from "@/lib/db";

export const dashboardRouter = createTRPCRouter({
    getStats: premiumProcedure.query(async ({ ctx }) => {
        const ownerId = ctx.auth.user.id;

        // Start of current month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Days until end of month (reset)
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const daysUntilReset = Math.max(
            0,
            Math.ceil((endOfMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        );

        const [totalAgents, activeAgents, inactiveAgents, agentsThisMonth, latestAgents] =
            await Promise.all([
                prisma.agent.count({ where: { ownerId } }),
                prisma.agent.count({ where: { ownerId, isActive: true } }),
                prisma.agent.count({ where: { ownerId, isActive: false } }),
                prisma.agent.count({
                    where: {
                        ownerId,
                        createdAt: { gte: startOfMonth },
                    },
                }),
                prisma.agent.findMany({
                    where: { ownerId },
                    orderBy: { createdAt: "desc" },
                    take: 6,
                }),
            ]);

        return {
            totalAgents,
            agentsThisMonth,
            totalMessages: 0, // no messages table yet
            activeAgents,
            inactiveAgents,
            daysUntilReset,
            latestAgents,
        };
    }),
});
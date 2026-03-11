import { protectedProcedure, router } from "@/trpc/init";
import { TRPCError } from "@trpc/server/unstable-core-do-not-import";
import prisma from "@/lib/db";
import { MESSAGE_LIMITS } from "@/config/constants";

export const profileRouter = router({
    getUser: protectedProcedure.query(async ({ ctx }) => {
        const user = ctx.auth.user;

        if (!user) {
            throw new TRPCError({
                code: "UNAUTHORIZED",
                message: "Unauthorized",
            });
        }

        // Current month range
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const [totalMessages, totalAgents] = await Promise.all([
            prisma.chatMessage.count({
                where: {
                    chat: { userId: user.id },
                    createdAt: { gte: startOfMonth },
                },
            }),
            prisma.agent.count({ where: { ownerId: user.id } }),
        ]);

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image ?? null,
            totalMessages,
            totalAgents,
            messageLimitFree: MESSAGE_LIMITS.FREE,
            messageLimitPro: MESSAGE_LIMITS.PRO,
        };
    }),
})
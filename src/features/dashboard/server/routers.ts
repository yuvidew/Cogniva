import { createTRPCRouter, premiumProcedure } from "@/trpc/init";
import prisma from "@/lib/db";
import z from "zod";
import { inngest } from "@/inngest/client";
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export const dashboardRouter = createTRPCRouter({
    getWorkflowStats: premiumProcedure.query(async ({ ctx }) => {
        return await prisma.workflow.findMany();
    }),
    textAi: premiumProcedure
        .input(z.object({ prompt: z.string().min(1).max(500) }))
        .mutation(async ({ input }) => {
            // const { text } = await generateText({
            //     model: google('gemini-2.5-flash'),
            //     prompt: input.prompt,
            // });

            // return {result : text};

            await inngest.send({
                name: "test/ai.function",
                data: {
                    prompt: input.prompt,
                },
            });

            return { success: true, message: `AI function triggered with prompt: ${input.prompt}` };
            
        }),
    createWorkflow: premiumProcedure
        .input(z.object({ name: z.string().min(1).max(100) }))
        .mutation(async ({ input }) => {

            await inngest.send({
                name: "test/hello.world",
                data: {
                    email: "yuvi@gmail.com",
                },
            });

            const { name } = input;
            return { success: true, message: `Workflow '${name}' created successfully` };
        }),
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
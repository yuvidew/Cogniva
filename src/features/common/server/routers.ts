import { createTRPCRouter, premiumProcedure } from "@/trpc/init";
import { AgentModelProvider } from "@/generated/prisma/client";
import z from "zod";
import prisma from "@/lib/db";
import { PAGINATION } from "@/config/constants";

export const agentRouter = createTRPCRouter({
    create: premiumProcedure
        .input(
            z.object({
                name: z.string().min(3, "Agent name must be at least 3 characters").max(100, "Agent name must be under 100 characters"),
                description: z.string().min(10, "Description must be at least 10 characters").max(300, "Description must be under 300 characters"),
                avatar: z.string().optional(),
                systemPrompt: z.string().min(20, "System prompt must be at least 20 characters"),
                model: z.nativeEnum(AgentModelProvider, { message: "Please select a model" }),
                temperature: z.number().min(0, "Temperature must be between 0 and 1").max(1, "Temperature must be between 0 and 1"),
                memoryEnabled: z.boolean().default(false),
                webSearchEnabled: z.boolean().default(false),
                fileUploadEnabled: z.boolean().default(false),
                strictMode: z.boolean().default(false),
                isActive: z.boolean().default(true),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const {
                name,
                description,
                avatar,
                systemPrompt,
                model,
                temperature,
                memoryEnabled,
                webSearchEnabled,
                fileUploadEnabled,
                strictMode,
                isActive,
            } = input;

            return prisma.agent.create({
                data: {
                    name,
                    description,
                    avatar,
                    systemPrompt,
                    model,
                    temperature,
                    memoryEnabled,
                    webSearchEnabled,
                    fileUploadEnabled,
                    strictMode,
                    isActive,
                    ownerId: ctx.auth.user.id,
                },
            })
        }),
    getMany: premiumProcedure
        .input(
            z.object({
                page: z.number().default(PAGINATION.DEFAULT_PAGE),
                pageSize: z
                    .number()
                    .min(PAGINATION.MIN_PAGE_SIZE)
                    .max(PAGINATION.MAX_PAGE_SIZE)
                    .default(PAGINATION.DEFAULT_PAGE_SIZE),
                search: z.string().default(""),
            })
        )
        .query(async ({ ctx, input }) => {
            const { page, pageSize, search } = input;

            const [items, totalCount] = await Promise.all([
                prisma.agent.findMany({
                    skip: (page - 1) * pageSize,
                    take: pageSize,
                    where: {
                        ownerId: ctx.auth.user.id,
                        name: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                    orderBy: {
                        createdAt: "desc",
                    },
                }),
                prisma.agent.count({
                    where: {
                        ownerId: ctx.auth.user.id,
                        name: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                }),
            ]);

            const totalPages = Math.ceil(totalCount / pageSize);
            const hasNextPage = page < totalPages;
            const hasPreviousPage = page > 1;

            return {
                items,
                page,
                pageSize,
                totalCount,
                hasNextPage,
                hasPreviousPage,
                totalPages,
            };
        }),

    getOne: premiumProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const agent = await prisma.agent.findFirst({
                where: {
                    id: input.id,
                    ownerId: ctx.auth.user.id,
                },
            });
            return agent;
        }),
    delete: premiumProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            await prisma.agent.deleteMany({
                where: {
                    id: input.id,
                    ownerId: ctx.auth.user.id,
                },
            });
            return { success: true };
        }),

    update: premiumProcedure
        .input(
            z.object({
                id: z.string(),
                name: z.string().min(3, "Agent name must be at least 3 characters").max(100, "Agent name must be under 100 characters").optional(),
                description: z.string().min(10, "Description must be at least 10 characters").max(300, "Description must be under 300 characters").optional(),
                avatar: z.string().optional(),
                systemPrompt: z.string().min(20, "System prompt must be at least 20 characters").optional(),
                model: z.nativeEnum(AgentModelProvider, { message: "Please select a model" }).optional(),
                temperature: z.number().min(0, "Temperature must be between 0 and 1").max(1, "Temperature must be between 0 and 1").optional(),
                memoryEnabled: z.boolean().optional(),
                webSearchEnabled: z.boolean().optional(),
                fileUploadEnabled: z.boolean().optional(),
                strictMode: z.boolean().optional(),
                isActive: z.boolean().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { id, ...data } = input;
            const agent = await prisma.agent.updateMany({
                where: {
                    id,
                    ownerId: ctx.auth.user.id,
                },
                data,
            });
            return agent;
        }),
});

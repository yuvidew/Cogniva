import { AgentModelProvider } from "@/generated/prisma/enums";
import prisma from "@/lib/db";
import { inngest } from "@/inngest/client";
import { createTRPCRouter, premiumProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import z from "zod";
import { InputFile } from "node-appwrite/file";
import { ID } from "node-appwrite";
import { createAdminClient } from "@/server/appwriter";
import { APPWRITER_BUCKET_ID, ENDPOINT, PROJECT_ID } from "@/lib/config";

export const agentByIdRouter = createTRPCRouter({
    getOne: premiumProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const now = new Date();
            const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

            const agent = await prisma.agent.findFirst({
                where: {
                    id: input.id,
                    ownerId: ctx.auth.user.id,
                },
                include: {
                    _count: {
                        select: { chats: true },
                    },
                },
            });

            if (!agent) return null;

            const [chatsThisMonth, chatsLastMonth, messagesThisMonth, filesCount] = await Promise.all([
                prisma.chat.count({
                    where: {
                        agentId: input.id,
                        createdAt: { gte: startOfThisMonth },
                    },
                }),
                prisma.chat.count({
                    where: {
                        agentId: input.id,
                        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
                    },
                }),
                prisma.chatMessage.count({
                    where: {
                        chat: { agentId: input.id },
                        createdAt: { gte: startOfThisMonth },
                    },
                }),
                prisma.fileUpload.count({
                    where: {
                        agentId: input.id,
                    },
                }),
            ]);

            const totalChats = agent._count.chats;
            const chatGrowthPercent =
                chatsLastMonth > 0
                    ? Math.round(((chatsThisMonth - chatsLastMonth) / chatsLastMonth) * 100)
                    : null;

            return {
                ...agent,
                stats: {
                    totalChats,
                    chatsThisMonth,
                    chatsLastMonth,
                    chatGrowthPercent,
                    messagesThisMonth,
                    filesCount,
                },
            };
        }),
    getOverView: premiumProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const agent = await prisma.agent.findFirst({
                where: {
                    id: input.id,
                    ownerId: ctx.auth.user.id,
                },
                select: {
                    systemPrompt: true,
                },
            });

            if (!agent) return null;

            const knowledgeBaseFiles = await prisma.fileUpload.findMany({
                where: {
                    agentId: input.id,
                },
                select: {
                    id: true,
                    fileName: true,
                    fileSize: true,
                    mimeType: true,
                    status: true,
                    createdAt: true,
                },
                orderBy: {
                    createdAt: "asc",
                },
            });

            return {
                systemPrompt: agent.systemPrompt,
                systemPromptCharCount: agent.systemPrompt.length,
                knowledgeBase: knowledgeBaseFiles.map((file) => ({
                    id: file.id,
                    fileName: file.fileName,
                    fileSize: file.fileSize,
                    mimeType: file.mimeType,
                    status: file.status,
                    createdAt: file.createdAt,
                })),
            };
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
    startChat: premiumProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const agent = await prisma.agent.findFirst({
                where: { id: input.id, ownerId: ctx.auth.user.id },
            });
            if (!agent) throw new TRPCError({ code: "NOT_FOUND", message: "Agent not found" });

            const chat = await prisma.chat.create({
                data: {
                    title: "New conversation",
                    userId: ctx.auth.user.id,
                    agentId: input.id,
                },
            });
            return chat;
        }),
    getChats: premiumProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const chats = await prisma.chat.findMany({
                where: { agentId: input.id, userId: ctx.auth.user.id },
                include: {
                    _count: { select: { messages: true } },
                    messages: {
                        orderBy: { createdAt: "desc" },
                        take: 1,
                        select: { content: true },
                    },
                },
                orderBy: { updatedAt: "desc" },
            });
            return chats;
        }),
    getMessages: premiumProcedure
        .input(z.object({ id: z.string(), chatId: z.string() }))
        .query(async ({ ctx, input }) => {
            const messages = await prisma.chatMessage.findMany({
                where: {
                    chatId: input.chatId,
                    chat: { agentId: input.id, userId: ctx.auth.user.id },
                },
                orderBy: { createdAt: "asc" },
            });
            return messages;
        }),
    sendMessage: premiumProcedure
        .input(z.object({ id: z.string(), chatId: z.string(), content: z.string().min(1) }))
        .mutation(async ({ ctx, input }) => {
            const agent = await prisma.agent.findFirst({
                where: { id: input.id, ownerId: ctx.auth.user.id },
            });
            if (!agent) throw new TRPCError({ code: "NOT_FOUND", message: "Agent not found" });

            // Save user message
            await prisma.chatMessage.create({
                data: {
                    content: input.content,
                    role: "user",
                    chatId: input.chatId,
                    senderId: ctx.auth.user.id,
                },
            });

            // Fire Inngest background job to call Gemini and save the response
            await inngest.send({
                name: "agent/chat.message",
                data: {
                    agentId: input.id,
                    chatId: input.chatId,
                    userMessageContent: input.content,
                },
            });

            return { success: true };
        }),
    uploadFile: premiumProcedure
        .input(
            z.object({
                id: z.string(),           // agentId — no chatId needed, files tab is knowledge-base level
                fileName: z.string(),
                mimeType: z.string(),
                fileSize: z.number(),
                fileBase64: z.string(),   // base64-encoded file content
            })
        )
        .mutation(async ({ ctx, input }) => {
            // Verify the agent belongs to this user
            const agent = await prisma.agent.findFirst({
                where: { id: input.id, ownerId: ctx.auth.user.id },
            });
            if (!agent) throw new TRPCError({ code: "NOT_FOUND", message: "Agent not found" });

            // Convert base64 → Buffer and upload to Appwrite Storage
            const buffer = Buffer.from(input.fileBase64, "base64");
            const { storage } = await createAdminClient();

            const appwriteFile = await storage.createFile(
                APPWRITER_BUCKET_ID,
                ID.unique(),
                InputFile.fromBuffer(buffer, input.fileName),
            );

            // Build the public view URL
            const fileUrl = `${ENDPOINT}/storage/buckets/${APPWRITER_BUCKET_ID}/files/${appwriteFile.$id}/view?project=${PROJECT_ID}`;

            // Persist — linked directly to agent, no message/chat needed
            const fileUpload = await prisma.fileUpload.create({
                data: {
                    fileName: input.fileName,
                    fileUrl,
                    fileSize: input.fileSize,
                    mimeType: input.mimeType,
                    status: "completed",
                    uploaderId: ctx.auth.user.id,
                    agentId: input.id,
                },
            });

            return fileUpload;
        }),
    getFiles: premiumProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const files = await prisma.fileUpload.findMany({
                where: {
                    agentId: input.id,
                    uploader: { id: ctx.auth.user.id },
                },
                orderBy: { createdAt: "desc" },
            });
            return files;
        }),
    deleteFile: premiumProcedure
        .input(z.object({ id: z.string(), fileId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const file = await prisma.fileUpload.findFirst({
                where: { id: input.fileId, agentId: input.id, uploaderId: ctx.auth.user.id },
            });
            if (!file) throw new TRPCError({ code: "NOT_FOUND", message: "File not found" });

            // Extract Appwrite file ID from the stored URL and delete from storage
            try {
                const urlMatch = file.fileUrl.match(/\/files\/([^/]+)\//);
                if (urlMatch?.[1]) {
                    const { storage } = await createAdminClient();
                    await storage.deleteFile(APPWRITER_BUCKET_ID, urlMatch[1]);
                }
            } catch {
                // If Appwrite deletion fails, still remove from DB
            }

            await prisma.fileUpload.delete({ where: { id: input.fileId } });

            return { success: true };
        }),
    deleteChat: premiumProcedure
        .input(z.object({ id: z.string(), chatId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const chat = await prisma.chat.findFirst({
                where: { id: input.chatId, agentId: input.id, userId: ctx.auth.user.id },
            });
            if (!chat) throw new TRPCError({ code: "NOT_FOUND", message: "Chat not found" });

            await prisma.chat.delete({
                where: { id: input.chatId },
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
})
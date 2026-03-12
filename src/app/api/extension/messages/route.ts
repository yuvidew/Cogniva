import { badRequest, getExtensionSession, handleOptions, unauthorized } from "@/lib/extension-auth";
import prisma from "@/lib/db";
import { inngest } from "@/inngest/client";
import type { NextRequest } from "next/server";

/**
 * GET /api/extension/messages?chatId=<id>
 * Returns all messages in a chat (must belong to the signed-in user).
 */
export async function GET(req: NextRequest) {
    const session = await getExtensionSession(req);
    if (!session) return unauthorized();

    const chatId = new URL(req.url).searchParams.get("chatId");
    if (!chatId) return badRequest("chatId is required");

    const chat = await prisma.chat.findFirst({
        where: { id: chatId, userId: session.user.id },
    });
    if (!chat) return Response.json({ error: "Chat not found" }, { status: 404 });

    const messages = await prisma.chatMessage.findMany({
        where: { chatId },
        orderBy: { createdAt: "asc" },
        select: { id: true, role: true, content: true, createdAt: true },
    });

    return Response.json({ messages });
}

/**
 * POST /api/extension/messages
 * Body: {
 *   chatId: string
 *   content: string
 *   pageContext?: { url: string; title: string; selectedText?: string; fullText?: string }
 * }
 *
 * Persists the user message (with optional page context appended) and
 * fires the Inngest AI job — the same pipeline used by the webapp.
 */
export async function POST(req: NextRequest) {
    const session = await getExtensionSession(req);
    if (!session) return unauthorized();

    const body = await req.json().catch(() => ({}));
    const { chatId, content, pageContext } = body as {
        chatId?: string;
        content?: string;
        pageContext?: {
            url: string;
            title: string;
            selectedText?: string;
            fullText?: string;
        };
    };

    if (!chatId) return badRequest("chatId is required");
    if (!content?.trim()) return badRequest("content is required");

    const chat = await prisma.chat.findFirst({
        where: { id: chatId, userId: session.user.id },
        select: { id: true, agentId: true },
    });
    if (!chat) return Response.json({ error: "Chat not found" }, { status: 404 });

    // Append webpage context to the message when provided
    let fullContent = content.trim();
    if (pageContext) {
        const contextLines: string[] = [];
        if (pageContext.selectedText) {
            contextLines.push(`Selected text:\n"${pageContext.selectedText}"`);
        } else if (pageContext.fullText) {
            // Truncate to avoid huge prompts
            const truncated = pageContext.fullText.slice(0, 4000);
            contextLines.push(`Page content:\n${truncated}${pageContext.fullText.length > 4000 ? "\n…(truncated)" : ""}`);
        }
        contextLines.push(`Page title: ${pageContext.title}`);
        contextLines.push(`URL: ${pageContext.url}`);
        fullContent = `${fullContent}\n\n---\n${contextLines.join("\n")}`;
    }

    // Persist user message
    const userMessage = await prisma.chatMessage.create({
        data: {
            chatId,
            role: "user",
            content: fullContent,
            senderId: session.user.id,
        },
    });

    // Trigger the same Inngest AI pipeline as the webapp
    // Wrapped in try/catch — if Inngest isn't running the user message is still
    // saved and returned; the AI reply will simply be absent until Inngest runs.
    try {
        await inngest.send({
            name: "agent/chat.message",
            data: {
                agentId: chat.agentId,
                chatId,
                userMessageContent: fullContent,
            },
        });
    } catch (inngestErr) {
        console.warn("[extension/messages] inngest.send failed – AI reply will not be generated:", inngestErr);
    }

    return Response.json({ message: userMessage });
}

export function OPTIONS() {
    return handleOptions();
}

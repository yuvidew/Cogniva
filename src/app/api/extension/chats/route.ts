import { badRequest, getExtensionSession, handleOptions, unauthorized } from "@/lib/extension-auth";
import prisma from "@/lib/db";
import type { NextRequest } from "next/server";

/**
 * GET /api/extension/chats?agentId=<id>
 * Returns the user's recent chats, optionally filtered by agent.
 */
export async function GET(req: NextRequest) {
    const session = await getExtensionSession(req);
    if (!session) return unauthorized();

    const agentId = new URL(req.url).searchParams.get("agentId") ?? undefined;

    const chats = await prisma.chat.findMany({
        where: { userId: session.user.id, ...(agentId ? { agentId } : {}) },
        orderBy: { updatedAt: "desc" },
        take: 20,
        select: { id: true, title: true, agentId: true, updatedAt: true },
    });

    return Response.json({ chats });
}

/**
 * POST /api/extension/chats
 * Body: { agentId: string }
 * Creates a new chat for the given agent.
 */
export async function POST(req: NextRequest) {
    const session = await getExtensionSession(req);
    if (!session) return unauthorized();

    const body = await req.json().catch(() => ({}));
    const { agentId } = body as { agentId?: string };

    if (!agentId) return badRequest("agentId is required");

    const agent = await prisma.agent.findFirst({
        where: { id: agentId, ownerId: session.user.id },
    });
    if (!agent) return Response.json({ error: "Agent not found" }, { status: 404 });

    const chat = await prisma.chat.create({
        data: { title: "Extension chat", userId: session.user.id, agentId },
    });

    return Response.json({ chat });
}

export function OPTIONS() {
    return handleOptions();
}

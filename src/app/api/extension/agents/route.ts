import { getExtensionSession, handleOptions, unauthorized } from "@/lib/extension-auth";
import prisma from "@/lib/db";
import type { NextRequest } from "next/server";

/**
 * GET /api/extension/agents
 * Returns the signed-in user's active agents (lightweight payload for the extension).
 */
export async function GET(req: NextRequest) {
    const session = await getExtensionSession(req);
    if (!session) return unauthorized();

    const agents = await prisma.agent.findMany({
        where: { ownerId: session.user.id, isActive: true },
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            name: true,
            description: true,
            avatar: true,
            model: true,
        },
    });

    return Response.json({ agents });
}

export function OPTIONS() {
    return handleOptions();
}

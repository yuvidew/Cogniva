import { auth } from "./auth";
import type { NextRequest } from "next/server";

/** CORS preflight response for extension routes */
export function handleOptions() {
    return new Response(null, {
        status: 204,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
    });
}

/** 401 shorthand */
export function unauthorized(message = "Unauthorized") {
    return Response.json({ error: message }, { status: 401 });
}

/** 400 shorthand */
export function badRequest(message: string) {
    return Response.json({ error: message }, { status: 400 });
}

/**
 * Resolves session from either:
 *   - Cookie header  (browser / same-origin)
 *   - Authorization: Bearer <token>  (extension)
 */
export async function getExtensionSession(req: NextRequest) {
    // Prefer cookie-based session (standard better-auth flow)
    let reqHeaders = req.headers;

    // If the extension sends a Bearer token, map it to the session cookie format
    const authHeader = req.headers.get("authorization") ?? "";
    if (authHeader.startsWith("Bearer ")) {
        const token = authHeader.slice(7).trim();
        const headers = new Headers(req.headers);
        headers.set("cookie", `better-auth.session_token=${token}`);
        reqHeaders = headers;
    }

    try {
        return await auth.api.getSession({ headers: reqHeaders });
    } catch {
        return null;
    }
}

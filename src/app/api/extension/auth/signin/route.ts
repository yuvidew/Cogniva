import { auth } from "@/lib/auth";
import { handleOptions } from "@/lib/extension-auth";
import type { NextRequest } from "next/server";

/**
 * POST /api/extension/auth/signin
 * Body: { email: string; password: string }
 *
 * Returns { token, user } so the extension can store the session
 * token in chrome.storage.local and send it as Bearer on every request.
 */
export async function POST(req: NextRequest) {
    const { email, password } = await req.json().catch(() => ({}));

    if (!email || !password) {
        return Response.json(
            { error: "email and password are required" },
            { status: 400 }
        );
    }

    try {
        // Call the better-auth sign-in handler and capture the raw response
        // so we can extract the session cookie value.
        const response = await auth.api.signInEmail({
            body: { email, password },
            headers: req.headers,
            asResponse: true,
        });

        const setCookie = response.headers.get("set-cookie") ?? "";
        // better-auth stores the session as "better-auth.session_token"
        const match = setCookie.match(/better-auth\.session_token=([^;]+)/);
        const token = match?.[1] ?? null;

        if (!token) {
            return Response.json({ error: "Sign-in failed" }, { status: 401 });
        }

        // Fetch the session to return the user object
        const session = await auth.api.getSession({
            headers: new Headers({
                cookie: `better-auth.session_token=${token}`,
            }),
        });

        return Response.json({
            token,
            user: session?.user
                ? {
                      id: session.user.id,
                      name: session.user.name,
                      email: session.user.email,
                      image: (session.user as { image?: string | null }).image ?? null,
                  }
                : null,
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Invalid credentials";
        return Response.json({ error: message }, { status: 401 });
    }
}

export function OPTIONS() {
    return handleOptions();
}

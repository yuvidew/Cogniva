/**
 * REST API client for the Cogniva extension.
 *
 * Every request attaches the stored Bearer token.
 * Import { API_BASE } if you need the base URL elsewhere.
 */
import { getToken } from "./auth";
import type { Agent, Chat, ExtUser, Message, PageContext } from "./types";

export const API_BASE =
    (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
    "http://localhost:3000";

// ─── Internals ────────────────────────────────────────────────────────────────

async function headers(): Promise<HeadersInit> {
    const token = await getToken();
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

async function parseJSON<T>(res: Response): Promise<T> {
    const text = await res.text();
    if (!text.trim()) {
        throw new Error(`Empty response from server (status ${res.status}) – check the Next.js console for errors`);
    }
    if (text.trimStart().startsWith("<")) {
        if (res.status === 404) throw new Error("API route not found (404) – restart the Next.js server");
        throw new Error(`Server returned HTML (status ${res.status}) – is the backend running?`);
    }
    let json: unknown;
    try {
        json = JSON.parse(text);
    } catch {
        throw new Error(`Invalid JSON from server (status ${res.status}): ${text.slice(0, 120)}`);
    }
    const j = json as Record<string, unknown>;
    if (!res.ok) throw new Error((j?.error as string) ?? `Request failed (${res.status})`);
    return json as T;
}

async function get<T>(path: string): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, { headers: await headers() });
    return parseJSON<T>(res);
}

async function post<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        headers: await headers(),
        body: JSON.stringify(body),
    });
    return parseJSON<T>(res);
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function signIn(
    email: string,
    password: string
): Promise<{ token: string; user: ExtUser }> {
    return post("/api/extension/auth/signin", { email, password });
}

// ─── Agents ───────────────────────────────────────────────────────────────────

export async function fetchAgents(): Promise<Agent[]> {
    const d = await get<{ agents: Agent[] }>("/api/extension/agents");
    return d.agents;
}

// ─── Chats ────────────────────────────────────────────────────────────────────

export async function createChat(agentId: string): Promise<Chat> {
    const d = await post<{ chat: Chat }>("/api/extension/chats", { agentId });
    return d.chat;
}

export async function fetchChats(agentId?: string): Promise<Chat[]> {
    const qs = agentId ? `?agentId=${agentId}` : "";
    const d  = await get<{ chats: Chat[] }>(`/api/extension/chats${qs}`);
    return d.chats;
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export async function fetchMessages(chatId: string): Promise<Message[]> {
    const d = await get<{ messages: Message[] }>(
        `/api/extension/messages?chatId=${encodeURIComponent(chatId)}`
    );
    return d.messages;
}

export async function sendMessage(
    chatId: string,
    content: string,
    pageContext?: PageContext
): Promise<Message> {
    const d = await post<{ message: Message }>("/api/extension/messages", {
        chatId,
        content,
        pageContext,
    });
    return d.message;
}

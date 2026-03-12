// ─── Shared types used across the extension ───────────────────────────────────

export interface ExtUser {
    id: string;
    name: string;
    email: string;
    image: string | null;
}

export interface Agent {
    id: string;
    name: string;
    description: string;
    avatar: string | null;
    model: string;
}

export interface Chat {
    id: string;
    title: string;
    agentId: string;
    updatedAt: string;
}

export interface Message {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    createdAt: string;
}

export interface PageContext {
    url: string;
    title: string;
    selectedText?: string;
    fullText?: string;
}

import { AgentModelProvider } from "@/generated/prisma/enums";

export type agent = {
    id: string;
    createdAt: string;
    updatedAt: string;
    name: string;
    description: string;
    avatar: string | null;
    systemPrompt: string;
    model: AgentModelProvider;
    temperature: number;
    memoryEnabled: boolean;
    webSearchEnabled: boolean;
    fileUploadEnabled: boolean;
    strictMode: boolean;
    isActive: boolean;
    ownerId: string;
}
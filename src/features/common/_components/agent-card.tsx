import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { AgentModelProvider } from "@/generated/prisma/enums";
import type { Agent as PrismaAgent } from "@/generated/prisma/client";
import { MessageCircleIcon } from "lucide-react";

type Agent = Omit<PrismaAgent, "createdAt" | "updatedAt"> & {
    createdAt: string | Date;
    updatedAt: string | Date;
};

const MODEL_DISPLAY: Record<AgentModelProvider, { label: string; color: string }> = {
    openai: { label: "GPT-4o", color: "bg-green-500" },
    anthropic: { label: "Claude 3.5", color: "bg-orange-500" },
    google: { label: "Gemini Pro", color: "bg-blue-500" },
};

const getModelDisplay = (model: AgentModelProvider) =>
    MODEL_DISPLAY[model] ?? { label: model, color: "bg-gray-500" };


interface AgentCardProps {
    agent: Agent;
}
export const AgentCard = ({ agent }: AgentCardProps) => {
    const modelDisplay = getModelDisplay(agent.model);
    return (
        <Card className="shadow-none px-4 py-4 gap-3 justify-between hover:shadow-md transition-shadow relative">
            <Badge
                variant="secondary"
                className={`absolute top-3 right-3 text-[11px] px-2 py-0 ${agent.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
            >
                <span className={`size-1.5 rounded-full ${agent.isActive ? "bg-green-500" : "bg-red-500"}`} />
                {agent.isActive ? "Active" : "Inactive"}
            </Badge>
            <CardHeader className="px-0 flex flex-row items-center gap-3">
                <Avatar className="size-10">
                    <AvatarImage src={agent.avatar ?? undefined} alt={agent.name} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                        {agent.avatar ? agent.avatar : agent.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1">
                    <h3 className="font-semibold text-sm leading-none">{agent.name}</h3>
                </div>
            </CardHeader>
            <CardContent className="px-0 py-0">
                <p className="text-muted-foreground text-sm leading-relaxed">
                    {agent.description}
                </p>
            </CardContent>
            <Separator />
            <CardFooter className="px-0 py-0 flex items-center justify-between">
                <Badge variant="secondary" className="gap-1.5 font-mono text-xs font-normal">
                    <span className={`size-2 rounded-full ${modelDisplay.color}`} />
                    {modelDisplay.label}
                </Badge>
                <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                    <MessageCircleIcon className="size-3.5" />
                    Open Chat
                </Button>
            </CardFooter>
        </Card>
    );
};
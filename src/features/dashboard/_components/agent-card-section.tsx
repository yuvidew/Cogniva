"use client";

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
import { MessageCircleIcon, ArrowRightIcon, PlusIcon } from "lucide-react";
import { AgentForm } from "./agent-form";
import { useAgentForm } from "../zustand-state/use-agent-form";
import Link from "next/link";
import { AgentModelProvider } from "@/generated/prisma/enums";
import type { Agent as PrismaAgent } from "@/generated/prisma/client";

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

const AgentCard = ({ agent }: { agent: Agent }) => {
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

const NewAgentCard = () => {
    const { openForm } = useAgentForm();
    return (
        <Card onClick={openForm} className="group shadow-none border-dashed border-2 border-muted-foreground flex items-center justify-center cursor-pointer hover:border-primary/40 hover:bg-muted/30 transition-colors">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <div className="size-12 rounded-full border-2 border-dashed border-muted-foreground group-hover:border-primary flex items-center justify-center transition-colors">
                    <PlusIcon className="size-5 text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all" />
                </div>
                <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">New Agent</span>
            </div>
        </Card>
    );
};

interface AgentCardSectionProps {
    agents : Agent[]
}

export const AgentCardSection = ({ agents }: AgentCardSectionProps) => {
    const { openForm} = useAgentForm();
    return (
        <>
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold">My Agents</h2>
                        <p className="text-sm text-muted-foreground">
                            {agents.length} agents active and ready
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/dashboard/agents">
                                View More
                                <ArrowRightIcon className="size-4" />
                            </Link>
                        </Button>
                        <Button onClick={openForm} className="bg-blue-600 hover:bg-blue-700 text-white">
                            <PlusIcon className="size-4" />
                            Create New Agent
                        </Button>
                    </div>
                </div>
                <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5">
                    {agents.map((agent) => (
                        <AgentCard key={agent.name} agent={agent} />
                    ))}
                    {agents.length < 6 && <NewAgentCard />}
                </div>
            </section>

            {/* Agent form component */}
            <AgentForm  />
        </>
    );
};

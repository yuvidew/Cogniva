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
import { MessageCircleIcon, PlusIcon } from "lucide-react";
import { AgentForm } from "./agent-form";
import { useAgentForm } from "../zustand-state/use-agent-form";

type Agent = {
    name: string;
    avatar: string;
    status: "active" | "inactive";
    description: string;
    model: string;
    modelColor: string;
};

const agents: Agent[] = [
    {
        name: "Sales Assistant",
        avatar: "",
        status: "active",
        description:
            "Handles inbound sales queries, qualifies leads, and books demos automatically for your team.",
        model: "GPT-4o",
        modelColor: "bg-green-500",
    },
    {
        name: "Content Writer",
        avatar: "",
        status: "active",
        description:
            "Generates blog posts, social media copy, and marketing content aligned to your brand voice.",
        model: "Gemini Pro",
        modelColor: "bg-blue-500",
    },
    {
        name: "Support Bot",
        avatar: "",
        status: "active",
        description:
            "Resolves common customer issues, routes tickets, and reduces support load by up to 60%.",
        model: "GPT-4o",
        modelColor: "bg-green-500",
    },
    {
        name: "Research Agent",
        avatar: "",
        status: "active",
        description:
            "Deep-dives into topics, compiles reports, and surfaces key insights from large document sets.",
        model: "Claude 3.5",
        modelColor: "bg-orange-500",
    },
    {
        name: "Data Analyst",
        avatar: "",
        status: "active",
        description:
            "Interprets CSV data, creates visual summaries, and answers business questions in plain English.",
        model: "Gemini Pro",
        modelColor: "bg-blue-500",
    },
];

const AgentCard = ({ agent }: { agent: Agent }) => {
    return (
        <Card className="shadow-none px-4 py-4 gap-3 justify-between hover:shadow-md transition-shadow">
            <CardHeader className="px-0 flex flex-row items-center gap-3">
                <Avatar className="size-10">
                    <AvatarImage src={agent.avatar} alt={agent.name} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                        {agent.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1">
                    <h3 className="font-semibold text-sm leading-none">{agent.name}</h3>
                    <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-700 text-[11px] px-2 py-0"
                    >
                        <span className="size-1.5 rounded-full bg-green-500" />
                        {agent.status === "active" ? "Active" : "Inactive"}
                    </Badge>
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
                    <span className={`size-2 rounded-full ${agent.modelColor}`} />
                    {agent.model}
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

export const AgentCardSection = () => {
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
                    <Button onClick={openForm} className="bg-blue-600 hover:bg-blue-700 text-white">
                        <PlusIcon className="size-4" />
                        Create New Agent
                    </Button>
                </div>
                <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5">
                    {agents.map((agent) => (
                        <AgentCard key={agent.name} agent={agent} />
                    ))}
                    <NewAgentCard />
                </div>
            </section>

            {/* Agent form component */}
            <AgentForm  />
        </>
    );
};

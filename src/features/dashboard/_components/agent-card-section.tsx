"use client";

import { Button } from "@/components/ui/button";

import {  ArrowRightIcon, PlusIcon } from "lucide-react";
import { AgentForm } from "./agent-form";
import { useAgentForm } from "../zustand-state/use-agent-form";
import Link from "next/link";
import type { Agent as PrismaAgent } from "@/generated/prisma/client";
import { AgentCard } from "@/features/common/_components/agent-card";
import { NewAgentCard } from "@/features/common/_components/new-agent-card";

type Agent = Omit<PrismaAgent, "createdAt" | "updatedAt"> & {
    createdAt: string | Date;
    updatedAt: string | Date;
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
                    {agents.length < 6 && <NewAgentCard onOpenAgentForm={openForm} />}
                </div>
            </section>

            {/* Agent form component */}
            <AgentForm  />
        </>
    );
};

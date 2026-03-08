import type { inferInput } from "@trpc/tanstack-react-query";
import {prefetch , trpc} from "@/trpc/server";

type Input = inferInput<typeof trpc.agent.getMany>;


/**
 * Prefetch all agents
 */
export const prefetchAgents = (params: Input) => {
    return prefetch(trpc.agent.getMany.queryOptions(params));
};

/**
 * Prefetch a single agent by ID
 */
export const prefetchAgent = (id: string) => {
    return prefetch(trpc.agentById.getOne.queryOptions({id}));
}
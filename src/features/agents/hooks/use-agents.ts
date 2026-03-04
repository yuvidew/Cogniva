import { useTRPC } from "@/trpc/client";
import { useAgentsParams } from "./use-agents-params";
import { useSuspenseQuery } from "@tanstack/react-query";

/** Hook to fetch agents with suspense */
export const useSuspenseAgents = () => {
    const trpc = useTRPC();
    const [params] = useAgentsParams();

    return useSuspenseQuery(trpc.agent.getMany.queryOptions(params));
}
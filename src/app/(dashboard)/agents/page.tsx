import { AgentCardsList, AgentsContainer, AgentsErrorView, AgentsLoadingView } from "@/features/agents/_components/agent-view"
import { agentsParamsLoader } from "@/features/agents/server/params-loader";
import { prefetchAgents } from "@/features/agents/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

interface AgentsPageProps {
    searchParams: Promise<Record<string, string | string[]>>;
}


const AgentsPage = async ({ searchParams }: AgentsPageProps) => {
    await requireAuth();

    const params = await agentsParamsLoader(searchParams);

    prefetchAgents(params);

    return (
        <AgentsContainer>
            <HydrateClient>
                <ErrorBoundary fallback={<AgentsErrorView />}>
                    <Suspense fallback={<AgentsLoadingView />} >
                        <AgentCardsList />
                    </Suspense>
                </ErrorBoundary>
            </HydrateClient>
        </AgentsContainer>
    )
}

export default AgentsPage
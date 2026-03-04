import { AgentCardsList, AgentsContainer, AgentsErrorView, AgentsLoadingView } from "@/features/agents/_components/agent-view"
import { HydrateClient } from "@/trpc/server"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"


const AgentsPage = () => {
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
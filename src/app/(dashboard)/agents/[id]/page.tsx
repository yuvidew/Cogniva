import { AgentDetailsView, AgentErrorView, AgentLoadingView } from '@/features/agents/_components/agent-details-view'
import { prefetchAgent } from '@/features/agents/server/prefetch'
import { requireAuth } from '@/lib/auth-utils'
import { HydrateClient } from '@/trpc/server'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

interface AgentDetailsByIdPageProps {
    params: Promise<{ id: string }>;
}

const AgentDetailsByIdPage = async ({ params }: AgentDetailsByIdPageProps) => {
    await requireAuth();

    const { id } = await params;
    
    prefetchAgent(id);
    return (
        <HydrateClient>
            <ErrorBoundary fallback={<AgentErrorView />}>
                <Suspense fallback={<AgentLoadingView />} >
                    <AgentDetailsView />
                </Suspense>
            </ErrorBoundary>
        </HydrateClient>
    )
}

export default AgentDetailsByIdPage
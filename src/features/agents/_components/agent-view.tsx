"use client";

import { EntityContainer } from "@/components/entity-components/entity-container";
import { EntityFilter } from "@/components/entity-components/entity-filter";
import { EntityHeader } from "@/components/entity-components/entity-header";
import { EntityPagination } from "@/components/entity-components/entity-pagination";
import { EntitySearch } from "@/components/entity-components/entity-search";
import { ErrorView } from "@/components/entity-components/error-view";
import { LoadingView } from "@/components/entity-components/loading-view";
import { AgentCard } from "@/features/common/_components/agent-card";
import { AgentForm } from "@/features/dashboard/_components/agent-form";
import { useAgentForm } from "@/features/dashboard/zustand-state/use-agent-form";
import { ReactNode } from "react";
import { useSuspenseAgents } from "../hooks/use-agents";
import { NewAgentCard } from "@/features/common/_components/new-agent-card";
import { useAgentsParams } from "../hooks/use-agents-params";
import { useEntitySearch } from "@/hooks/use-entity-search";

export const AgentsErrorView = () => <ErrorView  message="Failed to load agents." />;

export const AgentsLoadingView = () => <LoadingView message="Loading agents..." />;



const AgentsPagination = () => {
    const {isFetching, data} = useSuspenseAgents();
    const [params, setParams] = useAgentsParams();
    return (
        <EntityPagination
            disabled={isFetching}
            page={data?.page || 1}
            onPageChange={(page) => setParams({ ...params, page })}
            totalPages={data?.totalPages || 1}
        />
    )
}

const AgentsFilter = () => {
    const [params, setParams] = useAgentsParams();
    return (
        <EntityFilter
            value={params.filter || "all"}
            onChange={(filter) => setParams({ ...params, filter: filter as "all" | "active" | "inactive" })}
            placeholder="Filter agents..."
            options={[
                { value: "all", label: "All" },
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
            ]}
        />
    )
}

const AgentsSearch = () => {
    const [params , setParams] = useAgentsParams();
    const { searchValue, onSearchChange } = useEntitySearch({ params, setParams });
    return (
        <EntitySearch
            value={searchValue}
            onChange={onSearchChange}
            placeholder="Search agents..."
        />
    )
}


export const AgentsHeader = ({ disabled }: { disabled?: boolean }) => {
    const { openForm} = useAgentForm();

    return (
        <EntityHeader
            title='Agents'
            description='Manage your agents and their activities.'
            disabled={disabled}
            onNew={openForm}
            isCreating={false}
            newButtonLabel="Create Agent"
        />
    );
};

export const AgentCardsList = () => {
    const {data} = useSuspenseAgents();

    const { openForm } = useAgentForm();


    return (
        <section className='grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4'>
            {data?.items.map(agent => (
                <AgentCard
                    key={agent.id}
                    agent={agent}
                />
            ))}

            {!data?.items.length && (
                <NewAgentCard onOpenAgentForm={openForm}/>
            )}
        </section>
    )
}


export const AgentsContainer = ({ children }: { children: ReactNode }) => {
    return (

        <EntityContainer
            header={<AgentsHeader />}
            search={<AgentsSearch />}
            filter={<AgentsFilter />}
            pagination={<AgentsPagination />}
        >
            {children}

            {/* start : agent form */}
            <AgentForm/>
            {/* end : agent form */}
        </EntityContainer>
    )
}



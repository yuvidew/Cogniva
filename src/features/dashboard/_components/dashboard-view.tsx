"use client";

import { OverviewSection } from './overview-section';
import { Button } from '@/components/ui/button';
import { ZapIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { AgentCardSection } from './agent-card-section';
import { authClient } from '@/lib/auth-client';
import { useHasActiveSubscription } from '@/features/subscription/hooks/use-subscription';
import { LoadingView } from '@/components/common/loading-view';
import { ErrorView } from '@/components/common/error-view';
import { useSuspenseDashboardData } from '../hooks/use-dashboard';

export const DashboardLoading = () => {
    return <LoadingView message='Loading Dashboard...' />
};

export const DashboardError = () => {
    return <ErrorView message='Error loading Dashboard' />
};

export const DashboardView = () => {
    const { hasActiveSubscription , isLoading, isError} = useHasActiveSubscription();

    const {data} = useSuspenseDashboardData()
    
    const { data: session } = authClient.useSession();
    const user = session?.user;

    return (
        <main className="flex  flex-col justify-center gap-8">

            {/* start to greeting user */}
            <section className='flex lg:flex-row flex-col justify-between lg:gap-2 gap-4'>
                <div className='flex flex-col gap-1 flex-1'>
                    <h1 className="text-3xl font-medium flex items-center gap-2">
                        Welcome back, <span className=' text-primary'>{user?.name ?? "User"}</span>
                    </h1>
                    <p className="text-muted-foreground">
                        Here's what's happening with your projects today.
                    </p>
                </div>

                {/* start to your plan  */}

                {!hasActiveSubscription && !isLoading && !isError && (
                    <Card className='p-4 border rounded-md mt-auto lg:w-[30%] w-full  mx-auto '>
                        <div className='flex flex-col gap-4'>
                            <div className='flex items-center gap-2'>
                                <Button size="icon-sm">
                                    <ZapIcon />
                                </Button>

                                <div className='flex flex-col '>
                                    <h4 className=' font-medium'>Upgrade to Pro</h4>
                                    <p className='text-xs text-muted-foreground'>Get more power with a Pro plan.</p>
                                </div>
                            </div>

                            <Button onClick={() => authClient.checkout({ slug: "cognvia-pro" })} >
                                Upgrade to Pro - $29.99
                            </Button>
                        </div>
                    </Card>
                )}
                {/* end to your plan  */}
            </section>

            {/* end to greeting user */}

            {/* start to overview section */}
            <OverviewSection
                total_agents={data?.totalAgents ?? 0}
                total_messages={data?.totalMessages ?? 0}
                active_agents={data?.activeAgents ?? 0}
                inactive_agents={data?.inactiveAgents ?? 0}
                agents_this_month={data?.agentsThisMonth ?? 0}
                days_until_reset={data?.daysUntilReset ?? 0}
            />
            {/* end to overview section */}

            {/* start to agent card section */}
            <AgentCardSection agents={data?.latestAgents ?? []} />
            {/* end to agent card section */}


        </main>
    )
}

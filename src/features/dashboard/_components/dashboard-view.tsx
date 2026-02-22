"use client";

import { useGetUser } from '@/hooks/use-get-user';
import { OverviewSection } from './overview-section';
import { Button } from '@/components/ui/button';
import { ZapIcon } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { AgentCardSection } from './agent-card-section';

export const DashboardView = () => {
    const { data: user, isLoading } = useGetUser()
    return (
        <main className="flex  flex-col justify-center gap-8">

            {/* start to greeting user */}
            <section className='flex lg:flex-row flex-col justify-between lg:gap-2 gap-4'>
                <div className='flex flex-col gap-1 flex-1'>
                    <h1 className="text-3xl font-medium flex items-center gap-2">
                        Welcome back, {isLoading ? <span className=' text-primary'> ... </span> : <span className=' text-primary'>{user?.[0].name || "User"}</span>}
                    </h1>
                    <p className="text-muted-foreground">
                        Here's what's happening with your projects today.
                    </p>
                </div>

                {/* start to your plan  */}
                <Card className='p-4 border rounded-md mt-auto lg:w-[30%] w-full  mx-auto '>
                    <div className='flex flex-col gap-4'>
                        <div className='flex items-center gap-2'>
                            <Button size="icon-sm">
                                <ZapIcon />
                            </Button>

                            <div className='flex flex-col '>
                                <h4 className=' font-medium'>Free plan</h4>
                                <p className='text-xs text-muted-foreground'>Upgrade to more power </p>
                            </div>
                        </div>

                        <div className='flex flex-col gap-1'>
                            <div className='flex items-center justify-between'>
                                <p className='text-sm text-muted-foreground'>Messages left</p>
                                <p className='text-sm font-medium text-primary'>20 / 100</p>
                            </div>
                            <Progress value={20} max={100} />
                        </div>

                        <Button>
                            Upgrade to Pro - $10 / month
                        </Button>
                    </div>
                </Card>
                {/* end to your plan  */}
            </section>

            {/* end to greeting user */}

            {/* start to overview section */}
            <OverviewSection />
            {/* end to overview section */}

            {/* start to agent card section */}
            <AgentCardSection />
            {/* end to agent card section */}


        </main>
    )
}

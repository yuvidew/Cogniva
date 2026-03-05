"use client"

import { ArrowLeftIcon, MessageCircleIcon, LayoutGridIcon, FileTextIcon, CogIcon, SquarePenIcon, Trash2Icon,  } from 'lucide-react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FilesSection } from './file-section'
import { OverViewSection } from './overview-section'
import { ChatsSection } from './chart-section'
import { UpdateSection } from './update-section'
import { useTabQuery } from '@/hooks/use-tab-query'
import { DeleteAgent } from './delete-agent'



const AgentDetailsSection = () => {
    const { setTab } = useTabQuery("tab", "overview");
    const name = 'Sales Assistant'
    const statusLabel = 'Active'
    const modelLabel = 'GPT-4o'
    const modelTag = 'agt_x82kp'
    const description =
        'Handles inbound sales queries, qualifies leads, and books product demos automatically for your team. Optimized for high conversion and seamless handoff to human reps.'

    return (
        <section className="flex flex-col gap-4">
            <Card className='p-0 relative overflow-x-hidden shadow-none'>
                <div className={" w-[102%] h-1   absolute top-0 left-1/2 -translate-x-1/2 rounded-b-full bg-blue-500"} />
                <div className='p-6 flex flex-col gap-4'>
                    <div className="flex  items-start justify-between gap-4 ">
                        <div className='flex items-start gap-4'>
                            <Avatar className="size-14 rounded-xl">
                                <AvatarImage src={''} alt={name} />
                                <AvatarFallback className="rounded-xl text-lg font-semibold">
                                    {name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>

                            <div className='flex flex-col gap-3'>
                                <h1 className="text-2xl font-semibold leading-tight">
                                    {name}
                                </h1>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge
                                        variant="secondary"
                                        className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200"
                                    >
                                        <span className="size-1.5 rounded-full bg-emerald-500" />
                                        {statusLabel}
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className="border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700"
                                    >
                                        {modelLabel}
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className="border-muted-foreground/20 px-2.5 py-0.5 text-xs font-mono text-muted-foreground"
                                    >
                                        {modelTag}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div className='flex items-center justify-end gap-2'>
                            <Link href={"#tab-section"}>
                                <Button onClick={() => setTab("settings")} variant={"outline"} className='text-muted-foreground' size={"sm"}>
                                    <SquarePenIcon  /> Edit Agent
                                </Button>
                            </Link>
                            <DeleteAgent agent_name={name} conversation_count={147} file_upload_count={4}>
                                <Button variant={"destructive"} size={"sm"}>
                                    <Trash2Icon /> Delete
                                </Button>
                            </DeleteAgent>
                        </div>

                    </div>
                    <Separator />
                    <div className="flex items-start justify-between gap-2">
                        <p className="max-w-3xl text-md text-muted-foreground">
                            {description}
                        </p>

                        <div className="flex  items-center justify-end gap-3 px-4">
                            <div className='flex flex-col justify-center items-center'>
                                <span className="font-medium text-muted-foreground text-sm">Created</span>
                                <span className="text-sm">Jan 15, 2026</span>
                            </div>

                            <div className='flex flex-col justify-center items-center'>
                                <span className="font-medium text-muted-foreground text-sm">Updated</span>
                                <span className="text-sm">Mar 02, 2026</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-5 border-t  bg-muted/20 text-xs text-muted-foreground">
                    <div className="flex flex-col gap-1 px-6 py-4 border-r ">
                        <span className="text-xl font-bold text-foreground">147</span>
                        <span className="uppercase tracking-wide font-medium text-[11px]">Total chats</span>
                        <span className="text-[11px]">↑ 12% vs last month</span>
                    </div>
                    <div className="flex flex-col gap-1 px-6 py-4 border-r ">
                        <span className="text-xl font-bold text-foreground">32</span>
                        <span className="uppercase tracking-wide font-medium text-[11px]">Messages used</span>
                        <span className="text-[11px]">of 100 this month</span>
                    </div>
                    <div className="flex flex-col gap-1 px-6 py-4 border-r ">
                        <span className="text-xl font-bold text-foreground">4</span>
                        <span className="uppercase tracking-wide font-medium text-[11px]">Files</span>
                        <span className="text-[11px]">in knowledge base</span>
                    </div>
                    <div className="flex flex-col gap-1 px-6 py-4 border-r ">
                        <span className="text-xl font-bold text-foreground">0.4</span>
                        <span className="uppercase tracking-wide font-medium text-[11px]">Temperature</span>
                        <span className="text-[11px]">Balanced precision</span>
                    </div>
                    <div className="flex flex-col gap-1 px-6 py-4">
                        <span className="text-xl font-bold text-foreground">98%</span>
                        <span className="uppercase tracking-wide font-medium text-[11px]">Response rate</span>
                        <span className="text-[11px]">Avg. 1.2s latency</span>
                    </div>
                </div>

            </Card>
        </section>
    )
}

const DetailsTabs = () => {
    const { tab, setTab } = useTabQuery("tab", "overview");



    const tabList = [
        { value: "overview", label: "Overview", icon: LayoutGridIcon  },
        { value: "chats", label: "Chats", icon: MessageCircleIcon  },
        { value: "files", label: "Files", icon: FileTextIcon  },
        { value: "settings", label: "Update", icon: CogIcon  },
    ]
    return (
        <Card id='tab-section' className='p-0 shadow-none border-none'>
            <Tabs value={tab} onValueChange={setTab} className='py-2 '>
                <TabsList  className="bg-transparent   py-4 ">
                {tabList.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            className="flex-none px-8 py-3 shadow-none! rounded-none outline-none bg-transparent! text-sm font-semibold border-b-2 border-transparent! data-[state=inactive]:text-muted-foreground data-[state=inactive]:border-b-none data-[state=active]:border-b-primary! data-[state=active]:text-primary! "
                        >
                            <Icon className="size-4 " />
                            {tab.label}
                        </TabsTrigger>

                )})}

                </TabsList>


                <TabsContent value="overview" className="py-4 px-6 ">
                    <OverViewSection />
                </TabsContent>
                <TabsContent value="chats" className="py-4 px-6 ">
                    <ChatsSection/>
                </TabsContent>
                <TabsContent value="files" className="py-4 px-6 ">
                    <FilesSection />
                </TabsContent>
                <TabsContent value="settings" className="py-4 px-6 ">
                    <UpdateSection/>
                </TabsContent>
            </Tabs>
        </Card>
    )
}

export const AgentDetailsView = () => {
    return (
        <main className='flex flex-1 flex-col gap-5'>
            <Link href="/agents" prefetch className='flex items-center gap-1 text-sm text-primary hover:underline'>
                <ArrowLeftIcon className='size-4' /> Back to Agents
            </Link>

            {/* Start: Agent Details Section */}
            <AgentDetailsSection />
            {/* End: Agent Details Section */}

            {/* Start: Details Tabs */}
            <DetailsTabs />
            {/* End: Details Tabs */}
        </main>
    )
}

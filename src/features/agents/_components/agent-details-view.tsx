"use client"

import { ArrowLeftIcon, MessageCircleIcon, LayoutGridIcon, FileTextIcon, CogIcon, SquarePenIcon, Trash2Icon, VideoIcon, ImageIcon,  } from 'lucide-react'
import Link from 'next/link'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FilesSection } from './file-section'
import { OverViewSection } from './overview-section'
import { ChatsSection } from './chat-section'
import { UpdateSection } from './update-section'
import { useTabQuery } from '@/hooks/use-tab-query'
import { DeleteAgent } from './delete-agent'
import { ErrorView } from '@/components/entity-components/error-view'
import { LoadingView } from '@/components/entity-components/loading-view'
import { useSuspenseAgent } from '../hooks/use-agents'
import { cn, formatDate } from '@/lib/utils'
import { VideosSection } from './videos-section'
import { ImageSection } from './images-section'
import { AgentModelProvider } from '@/generated/prisma/enums'

export const AgentErrorView = () => <ErrorView  message="Failed to load agent." />;

export const AgentLoadingView = () => <LoadingView message="Loading agent..." />;

interface AgentDetailsViewProps {
    data : {
    id: string;
    createdAt: string;
    updatedAt: string;
    name: string;
    description: string;
    avatar: string | null;
    systemPrompt: string;
    model: AgentModelProvider;
    temperature: number;
    memoryEnabled: boolean;
    webSearchEnabled: boolean;
    fileUploadEnabled: boolean;
    imageProcessingEnabled: boolean;
    videoProcessingEnabled: boolean;
    strictMode: boolean;
    isActive: boolean;
    ownerId: string;
    _count: {
        chats: number;
    };
    stats: {
        totalChats: number;
        chatsThisMonth: number;
        chatsLastMonth: number;
        chatGrowthPercent: number | null;
        messagesThisMonth: number;
        filesCount: number;
        imagesCount: number;
        videosCount: number;
    };
}
}

const AgentDetailsSection = ({data}: AgentDetailsViewProps) => {

    const { setTab } = useTabQuery("tab", "overview");

    return (
        <section className="flex flex-col gap-4">
            <Card className='p-0 relative overflow-x-hidden shadow-none'>
                <div className={" w-[102%] h-1   absolute top-0 left-1/2 -translate-x-1/2 rounded-b-full bg-blue-500"} />
                <div className='p-6 flex flex-col gap-4'>
                    <div className="flex  items-start justify-between gap-4 ">
                        <div className='flex items-start gap-4'>
                            <Avatar className="size-14 rounded-xl">
                                <AvatarFallback className="rounded-xl text-lg font-semibold">
                                    {data?.avatar}
                                </AvatarFallback>
                            </Avatar>

                            <div className='flex flex-col gap-3'>
                                <h1 className="text-2xl font-semibold leading-tight">
                                    {data?.name}
                                </h1>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge
                                        variant="secondary"
                                        className={cn("flex items-center gap-1 rounded-full  px-2.5 py-0.5 text-xs font-medium  ", data?.isActive ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-red-100 text-red-700 border-red-200") }
                                    >
                                        <span className={cn("size-1.5 rounded-full", data?.isActive ? "bg-emerald-500" : "bg-red-500")} />
                                        {data?.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className="border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700"
                                    >
                                        {data?.model}
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
                            <DeleteAgent id={data?.id!} agent_name={data?.name!} conversation_count={147} file_upload_count={4}>
                                <Button variant={"destructive"} size={"sm"}>
                                    <Trash2Icon /> Delete
                                </Button>
                            </DeleteAgent>
                        </div>

                    </div>
                    <Separator />
                    <div className="flex items-start justify-between gap-2">
                        <p className="max-w-3xl text-md text-muted-foreground">
                            {data?.description}
                        </p>

                        <div className="flex  items-center justify-end gap-3 px-4">
                            <div className='flex flex-col justify-center items-center'>
                                <span className="font-medium text-muted-foreground text-sm">Created</span>
                                <span className="text-sm">{data?.createdAt ? formatDate(data.createdAt) : ''}</span>
                            </div>

                            <div className='flex flex-col justify-center items-center'>
                                <span className="font-medium text-muted-foreground text-sm">Updated</span>
                                <span className="text-sm">{data?.updatedAt ? formatDate(data.updatedAt) : ''}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-4 border-t  bg-muted/20 text-xs text-muted-foreground">
                    <div className="flex flex-col gap-1 px-6 py-4 border-r ">
                        <span className="text-xl font-bold text-foreground">{data?.stats.totalChats}</span>
                        <span className="uppercase tracking-wide font-medium text-[11px]">Total chats</span>
                        <span className="text-[11px]">↑ 12% vs last month</span>
                    </div>
                    <div className="flex flex-col gap-1 px-6 py-4 border-r ">
                        <span className="text-xl font-bold text-foreground">{data?.stats.messagesThisMonth}</span>
                        <span className="uppercase tracking-wide font-medium text-[11px]">Messages used</span>
                        <span className="text-[11px]">of 100 this month</span>
                    </div>
                    <div className="flex flex-col gap-1 px-6 py-4 border-r ">
                        <span className="text-xl font-bold text-foreground">
                            {data?.fileUploadEnabled && data?.stats.filesCount}
                            {data?.imageProcessingEnabled && data?.stats.imagesCount}
                            {data?.videoProcessingEnabled && data?.stats.videosCount}
                            {!data?.fileUploadEnabled && !data?.imageProcessingEnabled && !data?.videoProcessingEnabled && 0}
                        </span>
                        <span className="uppercase tracking-wide font-medium text-[11px]">
                            {data?.fileUploadEnabled && 'Files'}
                            {data?.imageProcessingEnabled && 'Images'}
                            {data?.videoProcessingEnabled && 'Videos'}
                            {!data?.fileUploadEnabled && !data?.imageProcessingEnabled && !data?.videoProcessingEnabled && 'Items'}
                        </span>
                        <span className="text-[11px]">
                            {data?.fileUploadEnabled && 'in knowledge base'}
                            {data?.imageProcessingEnabled && 'processed'}
                            {data?.videoProcessingEnabled && 'analyzed'}
                            {!data?.fileUploadEnabled && !data?.imageProcessingEnabled && !data?.videoProcessingEnabled && 'no feature enabled'}
                        </span>
                    </div>
                    <div className="flex flex-col gap-1 px-6 py-4  ">
                        <span className="text-xl font-bold text-foreground">{data?.temperature}</span>
                        <span className="uppercase tracking-wide font-medium text-[11px]">Temperature</span>
                        <span className="text-[11px]">Balanced precision</span>
                    </div>
                </div>

            </Card>
        </section>
    )
}

interface DetailsTabsProps {
    fileUploadEnabled: boolean;
    imageProcessingEnabled: boolean;
    videoProcessingEnabled: boolean;
}
const DetailsTabs = ({ fileUploadEnabled, imageProcessingEnabled, videoProcessingEnabled }: DetailsTabsProps) => {
    const { tab, setTab } = useTabQuery("tab", "overview");



    const tabList = [
        { value: "overview", label: "Overview", icon: LayoutGridIcon  },
        { value: "chats", label: "Chats", icon: MessageCircleIcon  },
        { value: "files", label: "Files", icon: FileTextIcon, isActive : fileUploadEnabled  },
        { value: "videos", label: "Videos", icon: VideoIcon, isActive : videoProcessingEnabled  },
        { value: "images", label: "Images", icon: ImageIcon, isActive : imageProcessingEnabled  },
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
                            className={`flex-none px-8 py-3 shadow-none! rounded-none outline-none bg-transparent! text-sm font-semibold border-b-2 border-transparent! data-[state=inactive]:text-muted-foreground data-[state=inactive]:border-b-none data-[state=active]:border-b-primary! data-[state=active]:text-primary! ${tab.isActive === false ? "opacity-50 cursor-not-allowed hidden" : ""}`}
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
                <TabsContent value="videos" className="py-4 px-6 ">
                    <VideosSection/>
                </TabsContent>
                <TabsContent value="images" className="py-4 px-6 ">
                    <ImageSection/>
                </TabsContent>
            </Tabs>
        </Card>
    )
}

export const AgentDetailsView = () => {
    const {data} = useSuspenseAgent();

    if (!data) {
        return <AgentErrorView />;
    }

    return (
        <main className='flex flex-1 flex-col gap-5'>
            <Link href="/agents" prefetch className='flex items-center gap-1 text-sm text-primary hover:underline'>
                <ArrowLeftIcon className='size-4' /> Back to Agents
            </Link>

            {/* Start: Agent Details Section */}
            <AgentDetailsSection data={data} />
            {/* End: Agent Details Section */}

            {/* Start: Details Tabs */}
            <DetailsTabs fileUploadEnabled={data?.fileUploadEnabled} imageProcessingEnabled={data?.imageProcessingEnabled} videoProcessingEnabled={data?.videoProcessingEnabled} />
            {/* End: Details Tabs */}
        </main>
    )
}

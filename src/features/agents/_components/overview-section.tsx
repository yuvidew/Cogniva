import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { ArrowRightIcon, BarChart3Icon, CalendarIcon, CheckCircle2Icon, CpuIcon, FileIcon, FileTextIcon, FolderOpenIcon, HashIcon, InfoIcon, MessageSquareIcon, ThermometerIcon, ZapIcon } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'

const knowledgeBaseFiles = [
    { name: 'product-catalog.pdf', type: 'PDF', size: '842 KB', date: 'Jan 15', color: 'text-red-500 bg-red-50', indexed: true },
    { name: 'pricing-tiers.csv', type: 'CSV', size: '28 KB', date: 'Jan 16', color: 'text-green-600 bg-green-50', indexed: true },
    { name: 'sales-guide.txt', type: 'TXT', size: '156 KB', date: 'Jan 18', color: 'text-rose-500 bg-rose-50', indexed: true },
    { name: 'company-info.docx', type: 'DOCX', size: '1.4 MB', date: 'Jan 20', color: 'text-blue-500 bg-blue-50', indexed: true },
]

export const OverViewSection = () => {
    const systemPrompt = `You are a professional sales assistant for AgentForge. Your role is to:

• Greet visitors warmly and understand their needs
• Qualify leads by asking about team size, budget, and timelin...`

    return (
        <section className="flex flex-col gap-6">
            {/* Agent Info Header */}
            <Card className="p-5 shadow-none">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Avatar className="size-14 rounded-xl">
                            <AvatarImage src="" alt="Sales Assistant" />
                            <AvatarFallback className="rounded-xl text-lg font-semibold bg-amber-100 text-amber-700">
                                S
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-baseline gap-2">
                                <h2 className="text-xl font-bold">Sales</h2>
                                <span className="text-lg italic text-muted-foreground">Assistant</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                    <span className="size-2 rounded-full bg-emerald-500" />
                                    Online
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <CpuIcon className="size-3.5" />
                                    Model: GPT-4o
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <CalendarIcon className="size-3.5" />
                                    Created Jan 15, 2026
                                </span>
                                <span className="font-mono text-xs text-muted-foreground/70">
                                    ID: agt_x82kp
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="rounded-full border-emerald-200 bg-emerald-50  font-medium text-emerald-700">
                            <span className="size-2 rounded-full bg-emerald-500 mr-1.5" />
                            Active
                        </Badge>
                        <Badge variant="outline" className="rounded-full border-blue-200 bg-blue-50  font-mono font-medium text-blue-700">
                            GPT-4o
                        </Badge>
                    </div>
                </div>
            </Card>

            {/* Usage & Configuration */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    <BarChart3Icon className="size-4" />
                    Usage & Configuration
                </div>
                <div className="grid grid-cols-4 gap-4">
                    {/* Messages Used */}
                    <Card className="p-5 shadow-none relative overflow-hidden gap-0 hover:shadow-md transition-shadow">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500 rounded-b-full" />
                        <div className="flex flex-col gap-3">

                            <Button variant={"default"} size={"icon-sm"} className='bg-blue-50 hover:bg-blue-50'>
                                <MessageSquareIcon className="size-4 text-blue-500" />
                            </Button>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold">32</span>
                                <span className="text-sm text-muted-foreground">/ 100</span>
                            </div>
                            <span className="text-sm font-medium text-muted-foreground">Messages Used</span>
                            <Progress value={32} className="h-1.5" />
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <InfoIcon className="size-3" />
                                Resets in 9 days
                            </span>
                        </div>
                    </Card>

                    {/* Files Uploaded */}
                    <Card className="p-5 shadow-none relative overflow-hidden gap-0 hover:shadow-md transition-shadow">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500 rounded-b-full" />
                        <div className="flex flex-col gap-3">
                            
                            <Button variant={"default"} size={"icon-sm"} className='bg-emerald-50 hover:bg-emerald-50'>
                                <FileIcon className="size-4 text-emerald-500" />
                            </Button>

                            <span className="text-3xl font-bold">4</span>
                            <span className="text-sm font-medium text-muted-foreground">Files Uploaded</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <CheckCircle2Icon className="size-3 text-emerald-500" />
                                All indexed
                            </span>
                        </div>
                    </Card>

                    {/* Temperature */}
                    <Card className="p-5 shadow-none relative overflow-hidden gap-0 hover:shadow-md transition-shadow">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500 rounded-b-full" />
                        <div className="flex flex-col gap-3">
                            <Button variant={"default"} size={"icon-sm"} className='bg-amber-50 hover:bg-amber-50'>
                                <ThermometerIcon className="size-4 text-amber-500" />

                            </Button>
                            <span className="text-3xl font-bold">0.4</span>
                            <span className="text-sm font-medium text-muted-foreground">Temperature</span>
                            <span className="text-xs text-muted-foreground">~  Balanced precision</span>
                        </div>
                    </Card>

                    {/* Max Tokens */}
                    <Card className="p-5 shadow-none relative overflow-hidden gap-0 hover:shadow-md transition-shadow">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-purple-500 rounded-b-full" />
                        <div className="flex flex-col gap-3">
                            <Button variant={"default"} size={"icon-sm"} className='bg-purple-50 hover:bg-purple-50'>
                                <HashIcon className="size-4 text-purple-500" />
                            </Button>
                            <span className="text-3xl font-bold">1,024</span>
                            <span className="text-sm font-medium text-muted-foreground">Max Tokens</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <InfoIcon className="size-3" />
                                Per response
                            </span>
                        </div>
                    </Card>
                </div>
            </div>

            {/* System Prompt + Knowledge Base */}
            <div className="grid grid-cols-2 gap-4">
                {/* System Prompt */}
                <Card className="p-6 shadow-none flex flex-col gap-1">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <MessageSquareIcon className="size-5 text-foreground" />
                            <h3 className="text-base font-bold">System Prompt</h3>
                        </div>
                        <span className="text-sm text-muted-foreground">284 chars</span>
                    </div>
                    <div className="flex-1 rounded-lg bg-muted/30 p-4 font-mono text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                        {systemPrompt}
                    </div>
                    <button type="button" className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                        View Full Prompt <ArrowRightIcon className="size-4" />
                    </button>
                </Card>

                {/* Knowledge Base */}
                <Card className="p-6 shadow-none flex flex-col gap-1">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <FolderOpenIcon className="size-5 text-foreground" />
                            <h3 className="text-base font-bold">Knowledge Base</h3>
                        </div>
                        <Button variant="outline" size="sm" className="text-xs gap-1">
                            Manage Files <ArrowRightIcon className="size-3.5" />
                        </Button>
                    </div>
                    <div className="flex flex-col gap-2 flex-1">
                        {knowledgeBaseFiles.map((file) => (
                            <div key={file.name} className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/30 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`size-10 rounded-lg flex items-center justify-center ${file.color}`}>
                                        <FileTextIcon className="size-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">{file.name}</span>
                                        <span className="text-xs text-muted-foreground font-mono">
                                            {file.type} · {file.size} · {file.date}
                                        </span>
                                    </div>
                                </div>
                                {file.indexed && (
                                    <Badge variant="outline" className="rounded-full border-emerald-200 bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
                                        Indexed
                                    </Badge>
                                )}
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Quick Test */}
            <Card className="p-4 shadow-none gap-0">
                <div className="flex items-center justify-between mb-4 ">
                    <div className="flex items-center gap-2">
                        <ZapIcon className="size-5 text-foreground" />
                        <h3 className="text-base font-bold">Quick Test</h3>
                    </div>
                    <Badge variant="outline" className="rounded-full border-amber-200 bg-amber-50 text-amber-700 text-xs font-medium">
                        Single response only · Full chat in Chats tab
                    </Badge>
                </div>
                <div className="flex items-center gap-3 ">
                    <Input
                        placeholder="Ask something to quickly test your agent..."
                        className="flex-1 h-12 rounded-px-5 text-sm"
                    />
                    <Button className="h-12  px-6 gap-2 text-sm font-semibold">
                        <ZapIcon className="size-4" />
                        Test
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                    <InfoIcon className="size-3" />
                    Use the <span className="font-semibold text-primary">Chats tab</span> for full conversation history.
                </p>
            </Card>
        </section>
    )
}

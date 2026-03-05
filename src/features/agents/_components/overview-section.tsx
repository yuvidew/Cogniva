import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRightIcon, FileTextIcon, FolderOpenIcon, InfoIcon, MessageSquareIcon, ZapIcon } from 'lucide-react'
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

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRightIcon, AlertCircleIcon, FileTextIcon, FolderOpenIcon, InfoIcon, MessageSquareIcon, ZapIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useAgentOverview } from '../hooks/use-agents'

function formatFileSize(bytes: number): string {
    if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
    if (bytes >= 1_000) return `${Math.round(bytes / 1_000)} KB`;
    return `${bytes} B`;
}

function formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getMimeLabel(mimeType: string): string {
    const map: Record<string, string> = {
        'application/pdf': 'PDF',
        'text/csv': 'CSV',
        'text/plain': 'TXT',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
        'application/msword': 'DOC',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
    };
    return map[mimeType] ?? mimeType.split('/').pop()?.toUpperCase() ?? 'FILE';
}

export const OverViewSection = () => {
    const { data, isLoading, isError } = useAgentOverview();


    if (isLoading) {
        return (
            <section className="flex flex-col gap-6">
                <div className="grid grid-cols-2 gap-4">
                    <Card className="p-6 shadow-none flex flex-col gap-3">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-4 w-28" />
                    </Card>
                    <Card className="p-6 shadow-none flex flex-col gap-3">
                        <Skeleton className="h-5 w-36" />
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-14 w-full rounded-lg" />
                        ))}
                    </Card>
                </div>
                <Card className="p-4 shadow-none flex flex-col gap-3">
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="h-12 w-full" />
                </Card>
            </section>
        );
    }

    if (isError) {
        return (
            <section className="flex flex-col gap-6">
                <Card className="p-10 shadow-none flex flex-col items-center justify-center gap-3 text-center">
                    <AlertCircleIcon className="size-8 text-destructive" />
                    <h3 className="text-base font-semibold">Failed to load overview</h3>
                    <p className="text-sm text-muted-foreground">Something went wrong while fetching agent details. Please try again.</p>
                </Card>
            </section>
        );
    }

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
                        <span className="text-sm text-muted-foreground">{data?.systemPromptCharCount} chars</span>
                    </div>
                    <div className="flex-1 rounded-lg bg-muted/30 p-4 font-mono text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                        {data?.systemPrompt}
                    </div>
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
                        {data?.knowledgeBase !== undefined && data?.knowledgeBase.length > 0 ? data?.knowledgeBase.map((file) => (
                            <div key={file.id} className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/30 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`size-10 rounded-lg flex items-center justify-center ${file.status === 'completed' ? 'text-green-600 bg-green-50' : 'text-muted-foreground bg-muted/50'}`}>
                                        <FileTextIcon className="size-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">{file.fileName}</span>
                                        <span className="text-xs text-muted-foreground font-mono">
                                            {getMimeLabel(file.mimeType)} · {formatFileSize(file.fileSize)} · {formatDate(file.createdAt)}
                                        </span>
                                    </div>
                                </div>
                                {file.status === 'completed' && (
                                    <Badge variant="outline" className="rounded-full border-emerald-200 bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
                                        Indexed
                                    </Badge>
                                )}
                            </div>
                        )) : (
                            <p className="text-sm text-muted-foreground">No knowledge base files available.</p>
                        )}
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

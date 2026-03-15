import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRightIcon, AlertCircleIcon, FileTextIcon, FolderOpenIcon, MessageSquareIcon, ImageIcon, VideoIcon } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useAgentOverview } from '../hooks/use-agents'
import { formatFileSize, getMimeLabel } from '@/lib/utils'
import Link from 'next/link'
import { useParams } from 'next/navigation'


export const OverViewSection = () => {
    const { data, isLoading, isError } = useAgentOverview();
    const { id: agentId } = useParams<{ id: string }>();


    if (isLoading) {
        return (
            <section className="grid grid-cols-2 gap-4">
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
        <section className="grid grid-cols-2 gap-4">
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

                {/* Knowledge Base - Shows based on enabled feature */}
                <Card className="p-6 shadow-none flex flex-col gap-1">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            {data?.fileUploadEnabled && <FolderOpenIcon className="size-5 text-foreground" />}
                            {data?.imageProcessingEnabled && <ImageIcon className="size-5 text-foreground" />}
                            {data?.videoProcessingEnabled && <VideoIcon className="size-5 text-foreground" />}
                            <h3 className="text-base font-bold">
                                {data?.fileUploadEnabled && 'Knowledge Base'}
                                {data?.imageProcessingEnabled && 'Processed Images'}
                                {data?.videoProcessingEnabled && 'Processed Videos'}
                            </h3>
                        </div>
                        <Link href={`/agents/${agentId}?tab=${data?.fileUploadEnabled ? 'files' : data?.imageProcessingEnabled ? 'images' : 'videos'}`}>
                            <Button variant="outline" size="sm" className="text-xs gap-1">
                                Manage <ArrowRightIcon className="size-3.5" />
                            </Button>
                        </Link>
                    </div>
                    
                    <div className="flex flex-col gap-2 flex-1">
                        {/* Files Section - when fileUploadEnabled */}
                        {data?.fileUploadEnabled && (
                            <>
                                {data?.knowledgeBase && data.knowledgeBase.length > 0 ? (
                                    <>
                                        {data.knowledgeBase.map((file) => (
                                            <div key={file.id} className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/30 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className={`size-10 rounded-lg flex items-center justify-center ${file.status === 'completed' ? 'text-green-600 bg-green-50' : 'text-muted-foreground bg-muted/50'}`}>
                                                        <FileTextIcon className="size-5" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium truncate max-w-45">{file.fileName}</span>
                                                        <span className="text-xs text-muted-foreground font-mono">
                                                            {getMimeLabel(file.mimeType)} · {formatFileSize(file.fileSize)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className={`rounded-full text-[11px] font-semibold ${file.status === 'completed' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-yellow-200 bg-yellow-50 text-yellow-700'}`}>
                                                    {file.status === 'completed' ? 'Indexed' : file.status}
                                                </Badge>
                                            </div>
                                        ))}
                                        {(data?.counts?.files ?? 0) > 5 && (
                                            <p className="text-xs text-muted-foreground text-center mt-2">
                                                +{(data?.counts?.files ?? 0) - 5} more files
                                            </p>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
                                        <FileTextIcon className="size-8 text-muted-foreground/30 mb-2" />
                                        <p className="text-sm text-muted-foreground">No files uploaded</p>
                                        <Link href={`/agents/${agentId}?tab=files`}>
                                            <Button variant="outline" size="sm" className="mt-3 text-xs gap-1">
                                                Upload Files <ArrowRightIcon className="size-3.5" />
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Images Section - when imageProcessingEnabled */}
                        {data?.imageProcessingEnabled && (
                            <>
                                {data?.images && data.images.length > 0 ? (
                                    <>
                                        {data.images.map((img) => (
                                            <div key={img.id} className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/30 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-10 rounded-lg overflow-hidden bg-muted/50">
                                                        {img.originalUrl ? (
                                                            <img src={img.originalUrl} alt={img.fileName} className="size-full object-cover" />
                                                        ) : (
                                                            <div className="size-full flex items-center justify-center">
                                                                <ImageIcon className="size-5 text-muted-foreground" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium truncate max-w-45">{img.fileName}</span>
                                                        <span className="text-xs text-muted-foreground font-mono">
                                                            {getMimeLabel(img.mimeType)} · {formatFileSize(img.fileSize)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className={`rounded-full text-[11px] font-semibold ${img.status === 'completed' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : img.status === 'processing' ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-yellow-200 bg-yellow-50 text-yellow-700'}`}>
                                                    {img.status === 'completed' ? 'Processed' : img.status}
                                                </Badge>
                                            </div>
                                        ))}
                                        {(data?.counts?.images ?? 0) > 5 && (
                                            <p className="text-xs text-muted-foreground text-center mt-2">
                                                +{(data?.counts?.images ?? 0) - 5} more images
                                            </p>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
                                        <ImageIcon className="size-8 text-muted-foreground/30 mb-2" />
                                        <p className="text-sm text-muted-foreground">No images processed</p>
                                        <Link href={`/agents/${agentId}?tab=images`}>
                                            <Button variant="outline" size="sm" className="mt-3 text-xs gap-1">
                                                Upload Images <ArrowRightIcon className="size-3.5" />
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Videos Section - when videoProcessingEnabled */}
                        {data?.videoProcessingEnabled && (
                            <>
                                {data?.videos && data.videos.length > 0 ? (
                                    <>
                                        {data.videos.map((vid) => {
                                            const isYouTube = vid.originalUrl?.includes('youtube.com') || vid.originalUrl?.includes('youtu.be')
                                            const youtubeId = isYouTube 
                                                ? vid.originalUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1]
                                                : null
                                            
                                            return (
                                                <div key={vid.id} className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/30 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-10 rounded-lg overflow-hidden bg-muted/50">
                                                            {isYouTube && youtubeId ? (
                                                                <img src={`https://img.youtube.com/vi/${youtubeId}/default.jpg`} alt={vid.fileName} className="size-full object-cover" />
                                                            ) : (
                                                                <div className="size-full flex items-center justify-center">
                                                                    <VideoIcon className="size-5 text-muted-foreground" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium truncate max-w-45">{vid.fileName}</span>
                                                            <span className="text-xs text-muted-foreground font-mono">
                                                                {isYouTube ? 'YouTube' : getMimeLabel(vid.mimeType)} · {formatFileSize(vid.fileSize)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <Badge variant="outline" className={`rounded-full text-[11px] font-semibold ${vid.status === 'completed' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : vid.status === 'processing' ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-yellow-200 bg-yellow-50 text-yellow-700'}`}>
                                                        {vid.status === 'completed' ? 'Analyzed' : vid.status}
                                                    </Badge>
                                                </div>
                                            )
                                        })}
                                        {(data?.counts?.videos ?? 0) > 5 && (
                                            <p className="text-xs text-muted-foreground text-center mt-2">
                                                +{(data?.counts?.videos ?? 0) - 5} more videos
                                            </p>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
                                        <VideoIcon className="size-8 text-muted-foreground/30 mb-2" />
                                        <p className="text-sm text-muted-foreground">No videos processed</p>
                                        <Link href={`/agents/${agentId}?tab=videos`}>
                                            <Button variant="outline" size="sm" className="mt-3 text-xs gap-1">
                                                Process Videos <ArrowRightIcon className="size-3.5" />
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </>
                        )}

                        {/* No feature enabled */}
                        {!data?.fileUploadEnabled && !data?.imageProcessingEnabled && !data?.videoProcessingEnabled && (
                            <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
                                <FolderOpenIcon className="size-8 text-muted-foreground/30 mb-2" />
                                <p className="text-sm text-muted-foreground">No knowledge base feature enabled</p>
                                <p className="text-xs text-muted-foreground/60 mt-1">
                                    Enable file upload, image processing, or video processing in settings
                                </p>
                            </div>
                        )}
                    </div>
                </Card>
        </section>
    )
}

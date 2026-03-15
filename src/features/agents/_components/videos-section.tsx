"use client"

/**
 * @fileoverview VideosSection Component
 * 
 * This module provides a comprehensive video management interface for AI agents.
 * It supports:
 * - Direct video file uploads (drag & drop or file picker)
 * - YouTube URL processing
 * - Video preview and playback
 * - AI-powered video analysis and summarization
 * - Video metadata display and management
 * 
 * The component integrates with Gemini AI for video processing and uses
 * Appwrite for file storage.
 */

// ============================================================================
// IMPORTS
// ============================================================================

// UI Components
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

// Icons from Lucide React
import { 
    VideoIcon,           // Default video placeholder icon
    LoaderIcon,          // Loading spinner for async operations
    PlusIcon,            // Add/Upload button icon
    Trash2Icon,          // Delete video icon
    UploadCloudIcon,     // Upload drop zone icon
    FolderOpenIcon,      // Empty state icon
    PlayIcon,            // Play/Preview video icon
    LinkIcon,            // URL processing button icon
    XIcon,               // Close/Clear input icon
    SparklesIcon,        // AI processing indicator icon
    FileTextIcon,        // View AI results icon
} from 'lucide-react'

// React hooks
import { useState, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'

// Custom hooks for video operations
import { 
    useAgentVideos,      // Fetches list of processed videos for the agent
    useUploadVideo,      // Handles video file upload mutation
    useDeleteVideo,      // Handles video deletion mutation
    useProcessVideoUrl,  // Handles YouTube/URL processing mutation
} from '../hooks/use-agents'

// Utility functions
import { formatFileSizeInFileSection, formatDateWithMonth } from '@/lib/utils'

// Dialog components for modals
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * ProcessedVideoData Interface
 * 
 * Local type definition to avoid TypeScript deep type instantiation issues
 * that can occur with complex Prisma-generated types.
 * 
 * @property {string} id - Unique identifier for the video record
 * @property {string} originalUrl - URL to the original uploaded video or YouTube URL
 * @property {string|null} processedUrl - URL to any post-processed video (if applicable)
 * @property {string|null} thumbnailUrl - URL to video thumbnail image
 * @property {string} fileName - Original filename or video title
 * @property {string} mimeType - Video MIME type (e.g., 'video/mp4')
 * @property {number} fileSize - File size in bytes
 * @property {number|null} duration - Video duration in seconds
 * @property {number|null} width - Video width in pixels
 * @property {number|null} height - Video height in pixels
 * @property {string} processingType - Type of AI processing (e.g., 'summarize')
 * @property {string} status - Processing status: 'pending', 'processing', 'completed', 'failed'
 * @property {Record<string, unknown>|null} metadata - AI analysis results stored as JSON
 * @property {string|null} errorMessage - Error message if processing failed
 * @property {Date|string} createdAt - Timestamp when video was added
 */
interface ProcessedVideoData {
    id: string
    originalUrl: string
    processedUrl: string | null
    thumbnailUrl: string | null
    fileName: string
    mimeType: string
    fileSize: number
    duration: number | null
    width: number | null
    height: number | null
    processingType: string
    status: string
    metadata: Record<string, unknown> | null
    errorMessage: string | null
    createdAt: Date | string
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * ALLOWED_VIDEO_EXTENSIONS
 * 
 * Whitelist of supported video file formats for upload.
 * These formats are widely supported and can be processed by Gemini AI.
 * 
 * Supported formats:
 * - .mp4  - Most common web video format (H.264/AVC codec)
 * - .webm - Open format, optimized for web (VP8/VP9 codec)
 * - .mov  - Apple QuickTime format
 * - .avi  - Microsoft Audio Video Interleave format
 * - .mkv  - Matroska Video container format
 */
const ALLOWED_VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.avi', '.mkv']

/**
 * MAX_VIDEO_SIZE
 * 
 * Maximum allowed file size for video uploads: 100 MB (in bytes).
 * This limit helps prevent:
 * - Server memory issues during upload processing
 * - Long upload times on slow connections
 * - Excessive storage costs
 * 
 * Calculation: 100 MB = 100 * 1024 * 1024 bytes = 104,857,600 bytes
 */
const MAX_VIDEO_SIZE = 100 * 1024 * 1024

/**
 * MAX_VIDEO_DURATION
 * 
 * Maximum allowed video duration: 1 hour (3600 seconds).
 * This limit ensures:
 * - Reasonable AI processing times
 * - Manageable API costs for video analysis
 * - Better user experience with faster results
 */
const MAX_VIDEO_DURATION = 3600

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Converts a File object to a Base64-encoded string.
 * 
 * This is necessary for uploading video files through the API,
 * as binary data needs to be serialized for JSON transmission.
 * 
 * @param {File} file - The file to convert
 * @returns {Promise<string>} Base64-encoded file content (without data URI prefix)
 * 
 * @example
 * const base64 = await toBase64(videoFile);
 * // Returns: "AAAAIGZ0eXBtcDQy..." (raw base64 without prefix)
 */
const toBase64 = (file: File): Promise<string> => 
    new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => {
            const result = reader.result as string
            // Remove the data:video/xxx;base64, prefix to get raw base64
            const base64 = result.split(',')[1]
            resolve(base64)
        }
        reader.onerror = reject
    })

/**
 * Extracts the file extension from a filename.
 * 
 * Handles edge cases like files with multiple dots or no extension.
 * Returns lowercase extension with leading dot for consistency.
 * 
 * @param {string} fileName - The filename to parse
 * @returns {string} Lowercase file extension with dot (e.g., '.mp4') or empty string
 * 
 * @example
 * getFileExt('video.MP4')     // Returns: '.mp4'
 * getFileExt('my.video.webm') // Returns: '.webm'
 * getFileExt('noextension')   // Returns: ''
 */
const getFileExt = (fileName: string): string => {
    const parts = fileName.split('.')
    return parts.length > 1 ? `.${parts[parts.length - 1].toLowerCase()}` : ''
}

/**
 * Formats video duration from seconds to MM:SS display format.
 * 
 * @param {number|null} seconds - Duration in seconds, or null if unknown
 * @returns {string} Formatted duration string (e.g., '05:30') or '--:--' if null
 * 
 * @example
 * formatDuration(90)   // Returns: '01:30'
 * formatDuration(3661) // Returns: '61:01'
 * formatDuration(null) // Returns: '--:--'
 */
const formatDuration = (seconds: number | null): string => {
    if (!seconds) return '--:--'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * Validates whether a URL is a processable video URL.
 * 
 * Accepts two types of video URLs:
 * 1. YouTube URLs (youtube.com/watch?v=... or youtu.be/...)
 * 2. Direct video file URLs ending in supported extensions
 * 
 * @param {string} url - The URL to validate
 * @returns {boolean} True if the URL is a valid video URL
 * 
 * @example
 * isValidVideoUrl('https://youtube.com/watch?v=abc123')     // Returns: true
 * isValidVideoUrl('https://youtu.be/abc123')                // Returns: true
 * isValidVideoUrl('https://example.com/video.mp4')          // Returns: true
 * isValidVideoUrl('https://example.com/page.html')          // Returns: false
 * isValidVideoUrl('not-a-url')                              // Returns: false
 */
const isValidVideoUrl = (url: string): boolean => {
    try {
        const urlObj = new URL(url)
        // Check for YouTube URLs (both youtube.com and youtu.be short links)
        if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
            return true
        }
        // Check for direct video file URLs by extension
        const path = urlObj.pathname.toLowerCase()
        return ALLOWED_VIDEO_EXTENSIONS.some(ext => path.endsWith(ext))
    } catch {
        // URL constructor throws if URL is malformed
        return false
    }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * VideosSection Component
 * 
 * A comprehensive video management interface that allows users to:
 * - Upload video files via drag-and-drop or file picker
 * - Process YouTube URLs for AI analysis
 * - Preview uploaded videos and YouTube embeds
 * - View AI-generated analysis results
 * - Delete processed videos
 * 
 * The component integrates with:
 * - Gemini AI for video content analysis
 * - Appwrite for file storage
 * - Inngest for background job processing
 * - tRPC for API communication
 * 
 * @returns {JSX.Element} The video section UI
 */
export const VideosSection = () => {
    // ========================================================================
    // ROUTE PARAMETERS
    // ========================================================================
    
    /**
     * agentId - The unique identifier of the current agent.
     * Extracted from the URL path parameter /agents/[id]
     */
    const { id: agentId } = useParams<{ id: string }>()
    
    // ========================================================================
    // REFS
    // ========================================================================
    
    /**
     * fileInputRef - Reference to the hidden file input element.
     * Used to programmatically trigger the file picker dialog.
     */
    const fileInputRef = useRef<HTMLInputElement>(null)
    
    // ========================================================================
    // UI STATE
    // ========================================================================
    
    /**
     * isDragging - Tracks whether user is dragging files over the drop zone.
     * Used for visual feedback (border/background color changes).
     */
    const [isDragging, setIsDragging] = useState(false)
    
    /**
     * previewVideo - The video currently being previewed in the preview dialog.
     * Set to null when dialog is closed.
     */
    const [previewVideo, setPreviewVideo] = useState<ProcessedVideoData | null>(null)
    
    /**
     * showUrlDialog - Controls visibility of the URL input dialog.
     * Opened via "Process URL" button.
     */
    const [showUrlDialog, setShowUrlDialog] = useState(false)
    
    /**
     * videoUrl - The URL entered by the user in the URL dialog.
     * Validated before processing.
     */
    const [videoUrl, setVideoUrl] = useState('')
    
    /**
     * showResultDialog - Controls visibility of the AI results dialog.
     * Shows the metadata/analysis from Gemini AI.
     */
    const [showResultDialog, setShowResultDialog] = useState(false)
    
    /**
     * selectedVideo - The video whose AI results are being displayed.
     * Used to populate the results dialog.
     */
    const [selectedVideo, setSelectedVideo] = useState<ProcessedVideoData | null>(null)

    // ========================================================================
    // DATA FETCHING HOOKS
    // ========================================================================
    
    /**
     * useAgentVideos - Fetches the list of processed videos for this agent.
     * 
     * Returns:
     * - data: Array of ProcessedVideoData objects
     * - isLoading: Boolean indicating if initial fetch is in progress
     * 
     * The hook automatically refetches every 3 seconds to show
     * real-time processing status updates.
     */
    const { data, isLoading } = useAgentVideos()
    
    /**
     * videos - Type-safe array of processed videos.
     * Provides empty array fallback if data is undefined.
     */
    const videos: ProcessedVideoData[] = (data as ProcessedVideoData[] | undefined) ?? []
    
    // ========================================================================
    // MUTATION HOOKS
    // ========================================================================
    
    /**
     * uploadVideo - Mutation hook for uploading new video files.
     * 
     * Accepts:
     * - fileName, mimeType, fileSize, fileBase64
     * - width, height, duration (video metadata)
     * - processingType (e.g., 'summarize')
     * 
     * On success, triggers background AI processing via Inngest.
     */
    const uploadVideo = useUploadVideo()
    
    /**
     * deleteVideo - Mutation hook for deleting videos.
     * Removes both the database record and the stored file.
     */
    const deleteVideo = useDeleteVideo()
    
    /**
     * processVideoUrl - Mutation hook for processing YouTube/video URLs.
     * Creates a video record and triggers AI analysis.
     */
    const processVideoUrl = useProcessVideoUrl()

    const processFiles = useCallback(async (fileList: FileList | null) => {
        if (!fileList) return
        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i]
            const ext = getFileExt(file.name)
            
            // Validate file extension
            if (!ALLOWED_VIDEO_EXTENSIONS.includes(ext)) {
                toast.error(`Invalid file format: ${file.name}. Allowed formats: ${ALLOWED_VIDEO_EXTENSIONS.join(', ')}`)
                continue
            }
            
            // Validate file size
            if (file.size > MAX_VIDEO_SIZE) {
                toast.error(`File too large: ${file.name}. Maximum size is 100 MB`)
                continue
            }

            const fileBase64 = await toBase64(file)

            // Get video dimensions and duration
            const video = document.createElement('video')
            video.preload = 'metadata'
            video.src = `data:${file.type};base64,${fileBase64}`
            
            await new Promise((resolve) => { 
                video.onloadedmetadata = resolve
                video.onerror = resolve
            })

            // Validate video duration (max 1 hour)
            if (video.duration && video.duration > MAX_VIDEO_DURATION) {
                const durationMins = Math.floor(video.duration / 60)
                toast.error(`Video too long: ${file.name} (${durationMins} minutes). Maximum duration is 1 hour`)
                continue
            }

            await uploadVideo.mutateAsync({
                id: agentId,
                fileName: file.name,
                mimeType: file.type || 'video/mp4',
                fileSize: file.size,
                fileBase64,
                width: video.videoWidth || undefined,
                height: video.videoHeight || undefined,
                duration: Math.floor(video.duration) || undefined,
                processingType: 'summarize',
            })
        }
    }, [agentId, uploadVideo])

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        processFiles(e.target.files)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }, [processFiles])

    const handleDragOver = useCallback((e: React.DragEvent) => { 
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true) 
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => { 
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false) 
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
        processFiles(e.dataTransfer.files)
    }, [processFiles])

    const openFilePicker = () => fileInputRef.current?.click()

    const handleProcessUrl = useCallback(async () => {
        if (!videoUrl.trim() || !isValidVideoUrl(videoUrl)) return
        
        await processVideoUrl.mutateAsync({
            id: agentId,
            videoUrl: videoUrl.trim(),
            processingType: 'summarize',
        })
        
        setVideoUrl('')
        setShowUrlDialog(false)
    }, [agentId, videoUrl, processVideoUrl])

    const handleViewResult = (video: ProcessedVideoData) => {
        setSelectedVideo(video)
        setShowResultDialog(true)
    }

    return (
        <div className="flex flex-col gap-6">
            <input 
                ref={fileInputRef} 
                type="file" 
                multiple 
                accept={ALLOWED_VIDEO_EXTENSIONS.join(',')} 
                onChange={handleFileInput} 
                className="hidden" 
            />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold">Video Processing</h3>
                    <p className="text-sm text-muted-foreground">{videos.length} videos processed</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        className="gap-2" 
                        onClick={() => setShowUrlDialog(true)}
                    >
                        <LinkIcon className="size-4" />
                        Process URL
                    </Button>
                    <Button className="" onClick={openFilePicker} disabled={uploadVideo.isPending}>
                        {uploadVideo.isPending ? <LoaderIcon className="size-4 animate-spin" /> : <PlusIcon className="size-4" />}
                        {uploadVideo.isPending ? 'Uploading...' : 'Upload Video'}
                    </Button>
                </div>
            </div>

            {/* Drop Zone */}
            <div
                role="button" 
                tabIndex={0}
                onClick={openFilePicker}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openFilePicker() }}
                onDragOver={handleDragOver} 
                onDragLeave={handleDragLeave} 
                onDrop={handleDrop}
                className={`rounded-xl border-2 border-dashed transition-colors cursor-pointer ${
                    isDragging 
                        ? 'border-primary bg-primary/10' 
                        : 'border-muted-foreground/25 bg-muted/20 hover:border-primary/40 hover:bg-primary/5'
                }`}
            >
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                    <UploadCloudIcon className={`size-10 ${isDragging ? 'text-primary' : 'text-muted-foreground/40'}`} />
                    <div className="text-center">
                        <p className="text-sm font-semibold">
                            {isDragging ? 'Drop videos to upload' : 'Drop videos here or click to upload'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            MP4, WebM, MOV, AVI, MKV — max 100 MB, max 1 hour duration
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Or paste a YouTube URL to process directly
                        </p>
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap justify-center">
                        {ALLOWED_VIDEO_EXTENSIONS.map((ext) => (
                            <Badge key={ext} variant="outline" className="text-xs font-mono px-2.5 py-0.5 text-muted-foreground">
                                {ext}
                            </Badge>
                        ))}
                    </div>
                </div>
            </div>

            {/* Video Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <LoaderIcon className="size-5 animate-spin text-muted-foreground" />
                </div>
            ) : videos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {videos.map((video) => {
                        // Check if this is an uploaded video (has actual file) vs YouTube URL
                        const isUploadedVideo = video.originalUrl && !video.originalUrl.includes('youtube.com') && !video.originalUrl.includes('youtu.be')
                        const isYouTubeVideo = video.originalUrl?.includes('youtube.com') || video.originalUrl?.includes('youtu.be')
                        
                        // Extract YouTube video ID for thumbnail
                        const youtubeId = isYouTubeVideo 
                            ? video.originalUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1]
                            : null
                        
                        return (
                            <Card key={video.id} className="overflow-hidden group relative py-0">
                                <div className="aspect-video relative bg-muted">
                                    {/* Video preview - use video tag for uploaded videos */}
                                    {isUploadedVideo && video.originalUrl ? (
                                        <video 
                                            src={video.originalUrl}
                                            className="w-full h-full object-cover"
                                            muted
                                            preload="metadata"
                                            onMouseEnter={(e) => e.currentTarget.play()}
                                            onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                                        />
                                    ) : isYouTubeVideo && youtubeId ? (
                                        /* YouTube thumbnail */
                                        <img 
                                            src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
                                            alt={video.fileName}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : video.thumbnailUrl ? (
                                        <img 
                                            src={video.thumbnailUrl} 
                                            alt={video.fileName}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-muted to-muted/50">
                                            <VideoIcon className="size-12 text-muted-foreground/30" />
                                        </div>
                                    )}

                                    {/* Duration badge */}
                                    {video.duration && (
                                        <Badge className="absolute bottom-2 right-2 text-xs bg-black/70 text-white">
                                            {formatDuration(video.duration)}
                                        </Badge>
                                    )}

                                    {/* Overlay actions */}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        {(video.originalUrl || video.processedUrl) && (
                                            <Button 
                                                size="icon" 
                                                variant="secondary" 
                                                className="size-8"
                                                onClick={() => setPreviewVideo(video)}
                                            >
                                                <PlayIcon className="size-4" />
                                            </Button>
                                        )}
                                        {video.status === 'completed' && video.metadata && (
                                            <Button 
                                                size="icon" 
                                                variant="secondary" 
                                                className="size-8"
                                                onClick={() => handleViewResult(video)}
                                            >
                                                <FileTextIcon className="size-4" />
                                            </Button>
                                        )}
                                        <Button 
                                            size="icon" 
                                            variant="destructive" 
                                            className="size-8"
                                            disabled={deleteVideo.isPending}
                                            onClick={() => deleteVideo.mutate({ id: agentId, videoId: video.id })}
                                        >
                                            {deleteVideo.isPending ? (
                                                <LoaderIcon className="size-4 animate-spin" />
                                            ) : (
                                                <Trash2Icon className="size-4" />
                                            )}
                                        </Button>
                                </div>

                                    {/* Status badges */}
                                    <div className="absolute top-2 right-2 flex flex-col gap-1">
                                        {/* Upload status - show checkmark if video is uploaded */}
                                        {video.originalUrl && (
                                            <Badge className="text-xs bg-emerald-600 text-white">
                                                ✓ Uploaded
                                            </Badge>
                                        )}
                                        {/* Processing status */}
                                        
                                    </div>
                                </div>
                                <CardContent className="p-3">
                                    <p className="text-sm font-medium truncate">{video.fileName}</p>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                                        <span>{video.width && video.height ? `${video.width}x${video.height}` : 'Unknown'}</span>
                                        <span>{formatFileSizeInFileSection(video.fileSize)}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {formatDateWithMonth(new Date(video.createdAt))}
                                    </p>
                                    {video.errorMessage && (
                                        <p className="text-xs text-red-500 mt-1 truncate">
                                            {video.errorMessage}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg">
                    <FolderOpenIcon className="size-10 text-muted-foreground/30 mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">No videos processed</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                        Upload videos or paste YouTube URLs to analyze and summarize
                    </p>
                </div>
            )}

            {/* Video Preview Dialog */}
            <Dialog open={!!previewVideo} onOpenChange={() => setPreviewVideo(null)}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>{previewVideo?.fileName}</DialogTitle>
                    </DialogHeader>
                    {previewVideo && (previewVideo.processedUrl || previewVideo.originalUrl) && (
                        <div className="relative aspect-video">
                            {/* Check if YouTube video */}
                            {(previewVideo.originalUrl?.includes('youtube.com') || previewVideo.originalUrl?.includes('youtu.be')) ? (
                                <iframe
                                    src={`https://www.youtube.com/embed/${previewVideo.originalUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1] || ''}`}
                                    className="w-full h-full rounded-lg"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            ) : (
                                <video 
                                    src={previewVideo.processedUrl || previewVideo.originalUrl}
                                    controls
                                    autoPlay
                                    className="w-full h-full rounded-lg"
                                />
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* URL Input Dialog */}
            <Dialog open={showUrlDialog} onOpenChange={setShowUrlDialog}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <SparklesIcon className="size-5 text-primary" />
                            Process Video URL
                        </DialogTitle>
                        <DialogDescription>
                            Paste a YouTube URL or direct video link to analyze with AI
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4">
                        <div className="flex gap-2 relative">
                            <Input
                                placeholder="https://www.youtube.com/watch?v=..."
                                value={videoUrl}
                                onChange={(e) => setVideoUrl(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault()
                                        handleProcessUrl()
                                    }
                                }}
                                className="pr-8"
                            />
                            {videoUrl && (
                                <XIcon 
                                    className="size-4 text-muted-foreground hover:text-foreground cursor-pointer absolute right-3 top-1/2 -translate-y-1/2" 
                                    onClick={() => setVideoUrl('')} 
                                />
                            )}
                        </div>
                        {videoUrl && !isValidVideoUrl(videoUrl) && (
                            <p className="text-xs text-red-500">
                                Please enter a valid YouTube URL or direct video link
                            </p>
                        )}
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowUrlDialog(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleProcessUrl}
                                disabled={!videoUrl.trim() || !isValidVideoUrl(videoUrl) || processVideoUrl.isPending}
                            >
                                {processVideoUrl.isPending ? (
                                    <>
                                        <LoaderIcon className="size-4  animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <SparklesIcon className="size-4 " />
                                        Process Video
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Result Dialog */}
            <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
                <DialogContent className="max-w-2xl max-h-[80vh]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileTextIcon className="size-5 text-primary" />
                            AI Analysis Result
                        </DialogTitle>
                        <DialogDescription>
                            {selectedVideo?.fileName}
                        </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="max-h-[60vh]">
                        {selectedVideo?.metadata && (
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
                                    {typeof selectedVideo.metadata === 'string' 
                                        ? selectedVideo.metadata 
                                        : JSON.stringify(selectedVideo.metadata, null, 2)}
                                </pre>
                            </div>
                        )}
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </div>
    )
}

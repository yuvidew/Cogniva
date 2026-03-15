"use client"

/**
 * @fileoverview ImagesSection Component
 * 
 * This module provides a comprehensive image management interface for AI agents.
 * It supports:
 * - Direct image file uploads (drag & drop or file picker)
 * - Image preview and zoom functionality
 * - AI-powered image analysis and processing
 * - Image metadata display and management
 * 
 * The component integrates with:
 * - Gemini AI for image analysis
 * - Appwrite for file storage
 * - Inngest for background job processing
 * - tRPC for API communication
 */

// ============================================================================
// IMPORTS
// ============================================================================

// UI Components
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

// Icons from Lucide React
import { 
    ImageIcon,           // Default image placeholder and section icon
    LoaderIcon,          // Loading spinner for async operations
    PlusIcon,            // Add/Upload button icon
    Trash2Icon,          // Delete image icon
    UploadCloudIcon,     // Upload drop zone icon
    FolderOpenIcon,      // Empty state icon
    ZoomInIcon,          // Preview/Zoom image icon
} from 'lucide-react'

// React hooks
import { useState, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'

// Custom hooks for image operations
import { 
    useAgentImages,      // Fetches list of processed images for the agent
    useUploadImage,      // Handles image file upload mutation
    useDeleteImage,      // Handles image deletion mutation
} from '../hooks/use-agents'

// Utility functions
import { formatFileSizeInFileSection, formatDateWithMonth } from '@/lib/utils'

// Dialog components for modals
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * ProcessedImageData Interface
 * 
 * Local type definition to avoid TypeScript deep type instantiation issues
 * that can occur with complex Prisma-generated types.
 * 
 * @property {string} id - Unique identifier for the image record
 * @property {string} originalUrl - URL to the original uploaded image
 * @property {string|null} processedUrl - URL to any post-processed image (if applicable)
 * @property {string} fileName - Original filename of the uploaded image
 * @property {string} mimeType - Image MIME type (e.g., 'image/png', 'image/jpeg')
 * @property {number} fileSize - File size in bytes
 * @property {number|null} width - Image width in pixels
 * @property {number|null} height - Image height in pixels
 * @property {string} processingType - Type of AI processing (e.g., 'analyze')
 * @property {string} status - Processing status: 'pending', 'processing', 'completed', 'failed'
 * @property {Date|string} createdAt - Timestamp when image was added
 */
interface ProcessedImageData {
    id: string
    originalUrl: string
    processedUrl: string | null
    fileName: string
    mimeType: string
    fileSize: number
    width: number | null
    height: number | null
    processingType: string
    status: string
    createdAt: Date | string
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * ALLOWED_IMAGE_EXTENSIONS
 * 
 * Whitelist of supported image file formats for upload.
 * These formats are widely supported and can be processed by Gemini AI.
 * 
 * Supported formats:
 * - .jpg/.jpeg - JPEG format (most common for photos)
 * - .png       - PNG format (supports transparency)
 * - .gif       - GIF format (supports animation)
 * - .webp      - WebP format (modern, efficient compression)
 * - .svg       - SVG format (vector graphics)
 */
const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']

/**
 * MAX_IMAGE_SIZE
 * 
 * Maximum allowed file size for image uploads: 10 MB (in bytes).
 * This limit helps prevent:
 * - Server memory issues during upload processing
 * - Long upload times on slow connections
 * - Excessive storage costs
 * 
 * Calculation: 10 MB = 10 * 1024 * 1024 bytes = 10,485,760 bytes
 */
const MAX_IMAGE_SIZE = 10 * 1024 * 1024

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Converts a File object to a Base64-encoded string.
 * 
 * This is necessary for uploading image files through the API,
 * as binary data needs to be serialized for JSON transmission.
 * 
 * @param {File} file - The file to convert
 * @returns {Promise<string>} Base64-encoded file content (without data URI prefix)
 * 
 * @example
 * const base64 = await toBase64(imageFile);
 * // Returns: "iVBORw0KGgoAAAANSUhEUgAA..." (raw base64 without prefix)
 */
const toBase64 = (file: File): Promise<string> => 
    new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => {
            const result = reader.result as string
            // Remove the data:image/xxx;base64, prefix to get raw base64
            const base64 = result.split(',')[1]
            resolve(base64)
        }
        reader.onerror = reject
    })

/**
 * Extracts the file extension from a filename.
 * 
 * Handles edge cases like files with multiple dots or no extension.
 * Returns lowercase extension WITHOUT leading dot (differs from video version).
 * 
 * @param {string} fileName - The filename to parse
 * @returns {string} Lowercase file extension without dot (e.g., 'png') or empty string
 * 
 * @example
 * getFileExt('photo.PNG')       // Returns: 'png'
 * getFileExt('my.photo.jpeg')   // Returns: 'jpeg'
 * getFileExt('noextension')     // Returns: ''
 */
const getFileExt = (fileName: string): string => {
    const parts = fileName.split('.')
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
}

// ============================================================================
// INTERNAL COMPONENTS
// ============================================================================

/**
 * ImageUploadSection Component
 * 
 * Internal component that handles the image upload functionality.
 * Provides:
 * - Drag-and-drop upload zone
 * - File picker integration
 * - Image grid display with status badges
 * - Preview modal for full-size viewing
 * - Delete functionality
 * 
 * @returns {JSX.Element} The image upload section UI
 */
const ImageUploadSection = () => {
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
     * previewImage - URL of the image currently being previewed in the dialog.
     * Set to null when dialog is closed.
     */
    const [previewImage, setPreviewImage] = useState<string | null>(null)

    // ========================================================================
    // DATA FETCHING HOOKS
    // ========================================================================
    
    /**
     * useAgentImages - Fetches the list of processed images for this agent.
     * 
     * Returns:
     * - data: Array of ProcessedImageData objects
     * - isLoading: Boolean indicating if initial fetch is in progress
     * 
     * The hook automatically refetches to show real-time processing status updates.
     */
    const { data, isLoading } = useAgentImages()
    
    /**
     * images - Type-safe array of processed images.
     * Provides empty array fallback if data is undefined.
     */
    const images = (data ?? []) as ProcessedImageData[]
    
    // ========================================================================
    // MUTATION HOOKS
    // ========================================================================
    
    /**
     * uploadImage - Mutation hook for uploading new image files.
     * 
     * Accepts:
     * - fileName, mimeType, fileSize, fileBase64
     * - width, height (image dimensions)
     * - processingType (e.g., 'analyze')
     * 
     * On success, triggers background AI processing via Inngest.
     */
    const uploadImage = useUploadImage()
    
    /**
     * deleteImage - Mutation hook for deleting images.
     * Removes both the database record and the stored file.
     */
    const deleteImage = useDeleteImage()

    // ========================================================================
    // EVENT HANDLERS
    // ========================================================================

    /**
     * Processes an array of files for upload.
     * 
     * For each file:
     * 1. Validates file extension against ALLOWED_IMAGE_EXTENSIONS
     * 2. Validates file size against MAX_IMAGE_SIZE
     * 3. Converts file to base64 encoding
     * 4. Extracts image dimensions using browser Image API
     * 5. Uploads via the uploadImage mutation
     * 
     * @param {FileList|null} fileList - List of files from input or drop event
     */
    const processFiles = useCallback(async (fileList: FileList | null) => {
        if (!fileList) return
        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i]
            // Get extension with leading dot for comparison
            const ext = `.${getFileExt(file.name)}`
            
            // Skip files with unsupported extensions
            if (!ALLOWED_IMAGE_EXTENSIONS.includes(ext)) continue
            
            // Skip files that exceed size limit
            if (file.size > MAX_IMAGE_SIZE) continue

            // Convert file to base64 for API transmission
            const fileBase64 = await toBase64(file)

            // Create Image element to get dimensions
            const img = new Image()
            img.src = `data:${file.type};base64,${fileBase64}`
            await new Promise((resolve) => { img.onload = resolve })

            // Upload image with metadata
            await uploadImage.mutateAsync({
                id: agentId,
                fileName: file.name,
                mimeType: file.type || 'image/png',
                fileSize: file.size,
                fileBase64,
                width: img.width,
                height: img.height,
                processingType: 'analyze',
            })
        }
    }, [agentId, uploadImage])

    /**
     * Handles file selection from the file input element.
     * Processes selected files and resets the input value.
     * 
     * @param {React.ChangeEvent<HTMLInputElement>} e - Change event from file input
     */
    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        processFiles(e.target.files)
        // Reset input value to allow re-selecting the same file
        if (fileInputRef.current) fileInputRef.current.value = ''
    }, [processFiles])

    /**
     * Handles dragover event on the drop zone.
     * Prevents default behavior and updates dragging state for visual feedback.
     * 
     * @param {React.DragEvent} e - Drag event
     */
    const handleDragOver = useCallback((e: React.DragEvent) => { 
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true) 
    }, [])

    /**
     * Handles dragleave event on the drop zone.
     * Resets the dragging state when cursor leaves the zone.
     * 
     * @param {React.DragEvent} e - Drag event
     */
    const handleDragLeave = useCallback((e: React.DragEvent) => { 
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false) 
    }, [])

    /**
     * Handles drop event on the drop zone.
     * Processes dropped files and resets dragging state.
     * 
     * @param {React.DragEvent} e - Drop event containing transferred files
     */
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
        processFiles(e.dataTransfer.files)
    }, [processFiles])

    /**
     * Programmatically opens the file picker dialog.
     * Triggered by clicking the upload button or drop zone.
     */
    const openFilePicker = () => fileInputRef.current?.click()

    // ========================================================================
    // RENDER
    // ========================================================================

    return (
        <div className="flex flex-col gap-6">
            <input 
                ref={fileInputRef} 
                type="file" 
                multiple 
                accept={ALLOWED_IMAGE_EXTENSIONS.join(',')} 
                onChange={handleFileInput} 
                className="hidden" 
            />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold">Processed Images</h3>
                    <p className="text-sm text-muted-foreground">{images.length} images uploaded</p>
                </div>
                <Button className="gap-2" onClick={openFilePicker} disabled={uploadImage.isPending}>
                    {uploadImage.isPending ? <LoaderIcon className="size-4 animate-spin" /> : <PlusIcon className="size-4" />}
                    {uploadImage.isPending ? 'Uploading...' : 'Upload Image'}
                </Button>
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
                            {isDragging ? 'Drop images to upload' : 'Drop images here or click to upload'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            JPG, PNG, GIF, WebP, SVG — max 10 MB each
                        </p>
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap justify-center">
                        {ALLOWED_IMAGE_EXTENSIONS.map((ext) => (
                            <Badge key={ext} variant="outline" className="text-xs font-mono px-2.5 py-0.5 text-muted-foreground">
                                {ext}
                            </Badge>
                        ))}
                    </div>
                </div>
            </div>

            {/* Image Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <LoaderIcon className="size-5 animate-spin text-muted-foreground" />
                </div>
            ) : images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((image) => (
                        <Card key={image.id} className="overflow-hidden group relative py-0">
                            <div className="aspect-square relative bg-muted">
                                {image.processedUrl || image.originalUrl ? (
                                    <img 
                                        src={image.processedUrl || image.originalUrl} 
                                        alt={image.fileName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <ImageIcon className="size-12 text-muted-foreground/30" />
                                    </div>
                                )}

                                
                                {/* Overlay actions */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Button 
                                        size="icon" 
                                        variant="secondary" 
                                        className="size-8"
                                        onClick={() => setPreviewImage(image.processedUrl || image.originalUrl)}
                                    >
                                        <ZoomInIcon className="size-4" />
                                    </Button>
                                    <Button 
                                        size="icon" 
                                        variant="destructive" 
                                        className="size-8"
                                        disabled={deleteImage.isPending}
                                        onClick={() => deleteImage.mutate({ id: agentId, imageId: image.id })}
                                    >
                                        {deleteImage.isPending ? (
                                            <LoaderIcon className="size-4 animate-spin" />
                                        ) : (
                                            <Trash2Icon className="size-4" />
                                        )}
                                    </Button>
                                </div>

                                {/* Status badge */}
                                <Badge 
                                    className={`absolute top-2 right-2 text-xs ${
                                        image.status === 'completed' 
                                            ? 'bg-green-500' 
                                            : image.status === 'processing' 
                                            ? 'bg-blue-500' 
                                            : image.status === 'failed'
                                            ? 'bg-red-500'
                                            : 'bg-yellow-500'
                                    }`}
                                >
                                    {image.status}
                                </Badge>
                            </div>
                            <CardContent className="p-3">
                                <p className="text-sm font-medium truncate">{image.fileName}</p>
                                <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                                    <span>{image.width}x{image.height}</span>
                                    <span>{formatFileSizeInFileSection(image.fileSize)}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {formatDateWithMonth(new Date(image.createdAt))}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg">
                    <FolderOpenIcon className="size-10 text-muted-foreground/30 mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">No images uploaded</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                        Upload images to process and analyze
                    </p>
                </div>
            )}

            {/* Image Preview Dialog */}
            <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Image Preview</DialogTitle>
                    </DialogHeader>
                    {previewImage && (
                        <div className="relative aspect-video">
                            <img 
                                src={previewImage} 
                                alt="Preview" 
                                className="w-full h-full object-contain"
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

// ============================================================================
// EXPORTED COMPONENT
// ============================================================================

/**
 * ImageSection Component (Exported)
 * 
 * Main wrapper component for the image management section.
 * Provides consistent styling and section header with icon.
 * 
 * This is the component that should be imported and used in parent components.
 * It wraps the internal ImageUploadSection with proper section styling.
 * 
 * @returns {JSX.Element} The complete image management section
 * 
 * @example
 * // In agent details page
 * import { ImageSection } from './_components/images-section'
 * 
 * function AgentPage() {
 *   return (
 *     <div>
 *       <ImageSection />
 *     </div>
 *   )
 * }
 */
export const ImageSection = () => {
    return (
        <section className="flex flex-col gap-6">
            {/* Section Header with Icon */}
            <div className="flex items-center gap-2">
                <ImageIcon className="size-6 text-primary" />
                <h2 className="text-xl font-bold">Image Management</h2>
            </div>

            {/* Image Upload and Display Section */}
            <ImageUploadSection />
        </section>
    )
}

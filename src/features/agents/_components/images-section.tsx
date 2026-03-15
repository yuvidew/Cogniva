"use client"

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
    ImageIcon, 
    LoaderIcon, 
    PlusIcon, 
    Trash2Icon, 
    UploadCloudIcon, 
    FolderOpenIcon,
    ZoomInIcon,
} from 'lucide-react'
import { useState, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import { 
    useAgentImages, 
    useUploadImage, 
    useDeleteImage, 
} from '../hooks/use-agents'
import { formatFileSizeInFileSection, formatDateWithMonth } from '@/lib/utils'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

// Local types to avoid deep type instantiation issues
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

/**
 * ALLOWED_IMAGE_EXTENSIONS — whitelist of image formats
 */
const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']

/**
 * MAX_IMAGE_SIZE — maximum allowed size per image (10 MB)
 */
const MAX_IMAGE_SIZE = 10 * 1024 * 1024

/**
 * Convert file to base64 string
 */
const toBase64 = (file: File): Promise<string> => 
    new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => {
            const result = reader.result as string
            // Remove the data:image/xxx;base64, prefix
            const base64 = result.split(',')[1]
            resolve(base64)
        }
        reader.onerror = reject
    })

/**
 * Get file extension from filename
 */
const getFileExt = (fileName: string): string => {
    const parts = fileName.split('.')
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
}

/**
 * ImageUploadSection — handles image uploads for processing
 */
const ImageUploadSection = () => {
    const { id: agentId } = useParams<{ id: string }>()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [previewImage, setPreviewImage] = useState<string | null>(null)

    const { data, isLoading } = useAgentImages()
    const images = (data ?? []) as ProcessedImageData[]
    const uploadImage = useUploadImage()
    const deleteImage = useDeleteImage()

    const processFiles = useCallback(async (fileList: FileList | null) => {
        if (!fileList) return
        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i]
            const ext = `.${getFileExt(file.name)}`
            if (!ALLOWED_IMAGE_EXTENSIONS.includes(ext)) continue
            if (file.size > MAX_IMAGE_SIZE) continue

            const fileBase64 = await toBase64(file)

            // Get image dimensions
            const img = new Image()
            img.src = `data:${file.type};base64,${fileBase64}`
            await new Promise((resolve) => { img.onload = resolve })

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

/**
 * ImageSection — main component for image upload and processing
 */
export const ImageSection = () => {
    return (
        <section className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
                <ImageIcon className="size-6 text-primary" />
                <h2 className="text-xl font-bold">Image Management</h2>
            </div>

            <ImageUploadSection />
        </section>
    )
}

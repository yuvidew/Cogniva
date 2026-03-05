import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileTextIcon, FolderOpenIcon, PlusIcon, Trash2Icon, UploadCloudIcon } from 'lucide-react'
import { useState, useCallback, useRef } from 'react'

type FileItem = {
    id: string
    name: string
    type: string
    size: string
    date: string
    color: string
}


const fileTypeColorMap: Record<string, string> = {
    pdf: 'text-red-500 bg-red-50',
    csv: 'text-green-600 bg-green-50',
    md: 'text-orange-500 bg-orange-50',
    docx: 'text-blue-500 bg-blue-50',
    txt: 'text-gray-500 bg-gray-50',
    json: 'text-yellow-600 bg-yellow-50',
}

const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const getFileExt = (name: string): string => {
    const parts = name.split('.')
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
}

const formatToday = (): string => {
    const now = new Date()
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${months[now.getMonth()]} ${String(now.getDate()).padStart(2, '0')}`
}

let fileIdCounter = 0
const nextFileId = () => `file-${++fileIdCounter}-${Date.now()}`

const ALLOWED_EXTENSIONS = ['.pdf', '.txt', '.docx', '.csv', '.md', '.json']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

const filesData: FileItem[] = [
    { id: nextFileId(), name: 'product-catalog.pdf', type: 'PDF', size: '842 KB', date: 'Jan 15', color: 'text-red-500 bg-red-50' },
    { id: nextFileId(), name: 'pricing-tiers.csv', type: 'CSV', size: '28 KB', date: 'Jan 16', color: 'text-green-600 bg-green-50' },
    { id: nextFileId(), name: 'onboarding-guide.md', type: 'MD', size: '156 KB', date: 'Jan 18', color: 'text-orange-500 bg-orange-50' },
    { id: nextFileId(), name: 'faq-v2.docx', type: 'DOCX', size: '1.4 MB', date: 'Jan 20', color: 'text-blue-500 bg-blue-50' },
]

export const FilesSection = () => {
    const [files, setFiles] = useState<FileItem[]>(filesData)
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const totalSize = useCallback(() => {
        // Simple display based on file count
        return `${files.length} files`
    }, [files.length])

    const handleDelete = (id: string) => {
        setFiles((prev) => prev.filter((f) => f.id !== id))
    }

    const processFiles = useCallback((fileList: FileList | null) => {
        if (!fileList) return

        const newFiles: FileItem[] = []

        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i]
            const ext = getFileExt(file.name)
            const dotExt = `.${ext}`

            // Validate extension
            if (!ALLOWED_EXTENSIONS.includes(dotExt)) {
                continue
            }

            // Validate size
            if (file.size > MAX_FILE_SIZE) {
                continue
            }

            newFiles.push({
                id: nextFileId(),
                name: file.name,
                type: ext.toUpperCase(),
                size: formatFileSize(file.size),
                date: formatToday(),
                color: fileTypeColorMap[ext] ?? 'text-gray-500 bg-gray-50',
            })
        }

        if (newFiles.length > 0) {
            setFiles((prev) => [...prev, ...newFiles])
        }
    }, [])

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        processFiles(e.target.files)
        // Reset so the same file can be re-selected
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
        <section className="flex flex-col gap-6">
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ALLOWED_EXTENSIONS.join(',')}
                onChange={handleFileInput}
                className="hidden"
            />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold">Knowledge Base</h2>
                    <p className="text-sm text-muted-foreground">{totalSize()} total</p>
                </div>
                <Button className="gap-2" onClick={openFilePicker}>
                    <PlusIcon className="size-4" />
                    Upload Files
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
                            {isDragging ? 'Drop files to upload' : 'Drop files here or click to upload'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">PDF, TXT, DOCX, CSV, MD — max 10 MB each</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        {ALLOWED_EXTENSIONS.map((ext) => (
                            <Badge key={ext} variant="outline" className="text-xs font-mono px-2.5 py-0.5 text-muted-foreground">
                                {ext}
                            </Badge>
                        ))}
                    </div>
                </div>
            </div>

            {/* File Table */}
            <div className="rounded-lg border overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-[1fr_120px_100px_120px_60px] gap-4 px-5 py-3 bg-muted/30 border-b text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <span>File</span>
                    <span>Type</span>
                    <span>Size</span>
                    <span>Uploaded</span>
                    <span />
                </div>

                {/* Table Rows */}
                {files.map((file) => (
                    <div
                        key={file.id}
                        className="grid grid-cols-[1fr_120px_100px_120px_60px] gap-4 px-5 py-4 items-center border-b last:border-b-0 hover:bg-muted/20 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`size-10 rounded-lg flex items-center justify-center flex-none ${file.color}`}>
                                <FileTextIcon className="size-5" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-medium truncate">{file.name}</span>
                                <span className="text-xs text-muted-foreground">Knowledge base · Indexed ✓</span>
                            </div>
                        </div>
                        <span className="text-sm font-mono text-muted-foreground">{file.type}</span>
                        <span className="text-sm font-mono text-muted-foreground">{file.size}</span>
                        <span className="text-sm text-muted-foreground">{file.date}</span>
                        <div className="flex justify-end">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-9 text-red-400 hover:text-red-600 hover:bg-red-50"
                                onClick={() => handleDelete(file.id)}
                            >
                                <Trash2Icon className="size-4" />
                            </Button>
                        </div>
                    </div>
                ))}

                {files.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <FolderOpenIcon className="size-10 text-muted-foreground/30 mb-3" />
                        <p className="text-sm font-medium text-muted-foreground">No files uploaded</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">Upload files to build your agent&apos;s knowledge base</p>
                    </div>
                )}
            </div>
        </section>
    )
}
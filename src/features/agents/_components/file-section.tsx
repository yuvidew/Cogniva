import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileTextIcon, FolderOpenIcon, LoaderIcon, PlusIcon, Trash2Icon, UploadCloudIcon } from 'lucide-react'
import { useState, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import { useAgentFiles, useUploadFile, useDeleteFile } from '../hooks/use-agents'
import { formatFileSizeInFileSection, formatDateWithMonth, getFileExt, fileTypeColorMap, toBase64 } from '@/lib/utils'

/**
 * ALLOWED_EXTENSIONS — whitelist of file extensions the knowledge base accepts.
 * Any file dropped or selected whose extension is not in this list will be
 * silently skipped in `processFiles`. Also rendered as badge labels in the
 * drop-zone so users know which formats are supported.
 */
const ALLOWED_EXTENSIONS = ['.pdf', '.txt', '.docx', '.csv', '.md', '.json']

/**
 * MAX_FILE_SIZE — maximum allowed size per file in bytes (10 MB).
 * Files exceeding this limit are silently skipped in `processFiles` to prevent
 * oversized uploads from reaching Appwrite Storage.
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

/**
 * FilesSection
 *
 * Knowledge-base management UI for a specific agent. Allows users to:
 * - Upload files via drag-and-drop or the native file picker.
 * - View all previously uploaded files with metadata (name, type, size, date).
 * - Delete individual files from both Appwrite Storage and the Prisma database.
 *
 * Files are scoped to the agent (`agentId`) — not to individual chats — so the
 * AI can reference them across all conversations with that agent.
 */
export const FilesSection = () => {
    /**
     * `agentId` — extracted from the URL param `[id]`.
     * Passed to every file mutation so uploads and deletes are scoped to the
     * correct agent's knowledge base.
     */
    const { id: agentId } = useParams<{ id: string }>()

    /**
     * `fileInputRef` — ref attached to the hidden `<input type="file">` element.
     * Programmatically triggered by `openFilePicker` when the user clicks the
     * "Upload Files" button or presses Enter/Space on the drop zone.
     */
    const fileInputRef = useRef<HTMLInputElement>(null)

    /**
     * `isDragging` — tracks whether a drag operation is currently hovering over
     * the drop zone. When `true`, the drop zone visually highlights with a
     * primary-colour border and background to indicate it is a valid drop target.
     */
    const [isDragging, setIsDragging] = useState(false)

    /**
     * `useAgentFiles` — fetches all `FileUpload` records for this agent from
     * the tRPC `getFiles` procedure. Returns `files` (array of file metadata)
     * and `isLoading` (boolean for the initial fetch skeleton state).
     */
    const { data: files = [], isLoading } = useAgentFiles()

    /**
     * `uploadFile` — tRPC mutation that converts a file to base64, posts it to
     * the `uploadFile` procedure, which stores it in Appwrite Storage and saves
     * a `FileUpload` record in Prisma linked to this agent.
     * `uploadFile.isPending` drives the loading spinner on the upload button.
     */
    const uploadFile = useUploadFile()

    /**
     * `deleteFile` — tRPC mutation that removes a file from Appwrite Storage
     * (by extracting the file ID from the stored URL) and deletes the
     * corresponding `FileUpload` row in Prisma.
     * `deleteFile.isPending` drives the loading spinner on each row's delete button.
     */
    const deleteFile = useDeleteFile()

    /**
     * `processFiles` — core upload handler. Iterates over a `FileList`,
     * validates each file against `ALLOWED_EXTENSIONS` and `MAX_FILE_SIZE`,
     * converts valid files to a base64 string via `toBase64`, then fires the
     * `uploadFile` mutation for each one sequentially.
     *
     * Memoised with `useCallback`; only recreated when `agentId` or
     * `uploadFile` reference changes.
     *
     * @param fileList - Native `FileList` from either a file-input change event
     *                   or a drag-and-drop event. Pass `null` to no-op safely.
     *
     * @example
     * // Called from handleFileInput and handleDrop
     * await processFiles(e.target.files)
     * await processFiles(e.dataTransfer.files)
     */
    const processFiles = useCallback(async (fileList: FileList | null) => {
        if (!fileList) return
        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i]
            const ext = `.${getFileExt(file.name)}`
            if (!ALLOWED_EXTENSIONS.includes(ext)) continue
            if (file.size > MAX_FILE_SIZE) continue
            const fileBase64 = await toBase64(file)
            await uploadFile.mutateAsync({
                id: agentId,
                fileName: file.name,
                mimeType: file.type || 'application/octet-stream',
                fileSize: file.size,
                fileBase64,
            })
        }
    }, [agentId, uploadFile])

    /**
     * `handleFileInput` — onChange handler for the hidden `<input type="file">`.
     * Passes the selected files to `processFiles`, then resets the input value
     * so the same file can be re-selected after a delete without the browser
     * ignoring the change event.
     *
     * @param e - React change event from the file input element.
     *
     * @example
     * <input type="file" onChange={handleFileInput} />
     */
    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        processFiles(e.target.files)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }, [processFiles])

    /**
     * `handleDragOver` — drag event handler that prevents the browser's default
     * behaviour (opening the file) and sets `isDragging` to `true` to
     * activate the drop-zone highlight style.
     *
     * @param e - React drag event fired while a dragged item is over the zone.
     */
    const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true) }, [])

    /**
     * `handleDragLeave` — drag event handler fired when the dragged item leaves
     * the drop zone. Resets `isDragging` to `false` to remove the highlight.
     *
     * @param e - React drag event fired when the pointer exits the drop zone.
     */
    const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false) }, [])

    /**
     * `handleDrop` — drop event handler. Prevents the browser from opening the
     * file, resets the drag state, and forwards the dropped `FileList` to
     * `processFiles` for validation and upload.
     *
     * @param e - React drag event fired when files are dropped on the zone.
     *
     * @example
     * <div onDrop={handleDrop} />
     */
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault(); e.stopPropagation(); setIsDragging(false)
        processFiles(e.dataTransfer.files)
    }, [processFiles])

    /**
     * `openFilePicker` — programmatically triggers a click on the hidden file
     * input to open the native OS file-picker dialog.
     * Called by the "Upload Files" button and by keyboard events (Enter/Space)
     * on the drop zone for accessibility.
     *
     * @example
     * <Button onClick={openFilePicker}>Upload Files</Button>
     */
    const openFilePicker = () => fileInputRef.current?.click()

    return (
        <section className="flex flex-col gap-6">
            <input ref={fileInputRef} type="file" multiple accept={ALLOWED_EXTENSIONS.join(',')} onChange={handleFileInput} className="hidden" />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold">Knowledge Base</h2>
                    <p className="text-sm text-muted-foreground">{files.length} files total</p>
                </div>
                <Button className="gap-2" onClick={openFilePicker} disabled={uploadFile.isPending}>
                    {uploadFile.isPending ? <LoaderIcon className="size-4 animate-spin" /> : <PlusIcon className="size-4" />}
                    {uploadFile.isPending ? 'Uploading...' : 'Upload Files'}
                </Button>
            </div>

            {/* Drop Zone */}
            <div
                role="button" tabIndex={0}
                onClick={openFilePicker}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openFilePicker() }}
                onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                className={`rounded-xl border-2 border-dashed transition-colors cursor-pointer ${isDragging ? 'border-primary bg-primary/10' : 'border-muted-foreground/25 bg-muted/20 hover:border-primary/40 hover:bg-primary/5'}`}
            >
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                    <UploadCloudIcon className={`size-10 ${isDragging ? 'text-primary' : 'text-muted-foreground/40'}`} />
                    <div className="text-center">
                        <p className="text-sm font-semibold">{isDragging ? 'Drop files to upload' : 'Drop files here or click to upload'}</p>
                        <p className="text-xs text-muted-foreground mt-1">PDF, TXT, DOCX, CSV, MD — max 10 MB each</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        {ALLOWED_EXTENSIONS.map((ext) => (
                            <Badge key={ext} variant="outline" className="text-xs font-mono px-2.5 py-0.5 text-muted-foreground">{ext}</Badge>
                        ))}
                    </div>
                </div>
            </div>

            {/* File Table */}
            <div className="rounded-lg border overflow-hidden">
                <div className="grid grid-cols-[1fr_120px_100px_120px_60px] gap-4 px-5 py-3 bg-muted/30 border-b text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <span>File</span><span>Type</span><span>Size</span><span>Uploaded</span><span />
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <LoaderIcon className="size-5 animate-spin text-muted-foreground" />
                    </div>
                ) : files.length > 0 ? files.map((file) => {
                    const ext = getFileExt(file.fileName)
                    const color = fileTypeColorMap[ext] ?? 'text-gray-500 bg-gray-50'
                    return (
                        <div key={file.id} className="grid grid-cols-[1fr_120px_100px_120px_60px] gap-4 px-5 py-4 items-center border-b last:border-b-0 hover:bg-muted/20 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className={`size-10 rounded-lg flex items-center justify-center flex-none ${color}`}>
                                    <FileTextIcon className="size-5" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-medium truncate">{file.fileName}</span>
                                    <span className="text-xs text-muted-foreground">Knowledge base  Indexed &amp;checkmark;</span>
                                </div>
                            </div>
                            <span className="text-sm font-mono text-muted-foreground">{ext.toUpperCase()}</span>
                            <span className="text-sm font-mono text-muted-foreground">{formatFileSizeInFileSection(file.fileSize)}</span>
                            <span className="text-sm text-muted-foreground">{formatDateWithMonth(new Date(file.createdAt))}</span>
                            <div className="flex justify-end">
                                <Button
                                    variant="ghost" size="icon"
                                    className="size-9 text-red-400 hover:text-red-600 hover:bg-red-50"
                                    disabled={deleteFile.isPending}
                                    onClick={() => deleteFile.mutate({ id: agentId, fileId: file.id })}
                                >
                                    {deleteFile.isPending ? <LoaderIcon className="size-4 animate-spin" /> : <Trash2Icon className="size-4" />}
                                </Button>
                            </div>
                        </div>
                    )
                }) : (
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

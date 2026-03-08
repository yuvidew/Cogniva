import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


/** Function to convert this type of date 2026-03-01T13:57:23.333Z to Jan 17, 2026 */
export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  return date.toLocaleDateString(undefined, options);
}

/** Function to convert this type of date 2026-03-01T13:57:23.333Z to relative date like "Today", "Yesterday", or "Jan 17" */
export const formatRelativeDate = (date: Date | string): string => {
    const d = new Date(date)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** Function to convert bytes to human readable format */
export const formatFileSize = (bytes: number): string => {
    if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
    if (bytes >= 1_000) return `${Math.round(bytes / 1_000)} KB`;
    return `${bytes} B`;
}

/** Function to get file type label from mime type */
export const formatDate1 = (date: Date | string): string => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Function to get file type label from mime type */
export const getMimeLabel = (mimeType: string): string => {
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

/** Function to get file type color from file extension */
export const fileTypeColorMap: Record<string, string> = {
    pdf: 'text-red-500 bg-red-50',
    csv: 'text-green-600 bg-green-50',
    md: 'text-orange-500 bg-orange-50',
    docx: 'text-blue-500 bg-blue-50',
    txt: 'text-gray-500 bg-gray-50',
    json: 'text-yellow-600 bg-yellow-50',
}

/** Function to format file size in file section */
export const formatFileSizeInFileSection = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** Function to format date with month */
export const formatDateWithMonth = (date: Date): string => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${months[date.getMonth()]} ${String(date.getDate()).padStart(2, '0')}`
}

/** Function to get file extension from file name */
export const getFileExt = (name: string): string => {
    const parts = name.split('.')
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
}

/** Function to convert a File object to base64 string */
export const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve((reader.result as string).split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(file)
    })
import { useState, useCallback, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { SearchIcon, PlusIcon, MessageCircleIcon, MoreHorizontalIcon, SendIcon, LoaderIcon, Trash2 } from 'lucide-react'
import { useAgentChats, useStartChat, useAIChat } from '../hooks/use-agents'
import { useParams } from 'next/navigation'

import { formatRelativeDate } from '@/lib/utils'
import { DeleteChat } from './delete-chat'



/**
 * ChatsSection
 *
 * Main chat UI component for a specific agent. Renders a two-panel layout:
 * - Left panel: scrollable list of all chats with search and "new chat" button.
 * - Right panel: selected chat messages with AI response polling, markdown
 *   rendering, auto-scroll, and a message input bar.
 *
 * All API interaction is delegated to custom hooks (`useAgentChats`,
 * `useAIChat`, `useStartChat`) so this component only owns presentation
 * state and user-interaction handlers.
 */
export const ChatsSection = () => {
    /**
     * `agentId` — extracted from the URL param `[id]`.
     * Used as the agent context for all chat operations (create, send, fetch).
     */
    const { id: agentId } = useParams<{ id: string }>()

    /**
     * `selectedChatId` — the ID of the currently open chat.
     * `null` means no chat is selected; the right panel shows an empty state.
     * Updated when the user clicks a sidebar chat item or creates a new chat.
     */
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null)

    /**
     * `search` — current value of the sidebar search input.
     * Used to filter `chats` in real-time via `filteredChats`.
     */
    const [search, setSearch] = useState('')

    /**
     * `messageInput` — current value of the message text input at the bottom.
     * Cleared immediately after the user submits so the field resets.
     */
    const [messageInput, setMessageInput] = useState('')

    /**
     * `useAgentChats` — fetches all chats belonging to this agent.
     * Returns `chats` (array) and `chatsLoading` (boolean) from TanStack Query.
     * Provides the sidebar list including title, last message preview, and count.
     */
    const { data: chats = [], isLoading: chatsLoading } = useAgentChats()

    /**
     * `useAIChat` — composite hook that owns the full AI chat lifecycle for
     * the currently selected chat:
     * - Polls for new messages every 2 s while waiting for the AI reply.
     * - Stops polling and invalidates `getChats` once the assistant message arrives
     *   (so the sidebar title updates without a page refresh).
     * - Exposes `send(content, chatId)` to submit a user message.
     *
     * Destructured values:
     * - `messages`       — ordered list of chat messages for the selected chat.
     * - `messagesLoading`— true on the initial messages fetch.
     * - `isWaitingForAI` — true while the background Inngest job is still running.
     * - `isSending`      — true while the `sendMessage` mutation is in-flight.
     * - `send`           — function to send a new user message.
     */
    const { messages, messagesLoading, isWaitingForAI, isSending, send } = useAIChat(selectedChatId)

    /**
     * `startChat` — mutation to create a new empty chat for this agent.
     * On success the new chat's ID is stored in `selectedChatId` so the right
     * panel immediately opens it.
     * `startChat.isPending` drives the loading spinner on the "+" button.
     */
    const startChat = useStartChat()

    /**
     * `messagesEndRef` — ref attached to an invisible `<div>` rendered after
     * the last message bubble (including the "Thinking..." indicator).
     * Used as a scroll target so the view always shows the newest content.
     */
    const messagesEndRef = useRef<HTMLDivElement>(null)

    /**
     * Auto-scroll effect — runs whenever `messages` or `isWaitingForAI` changes.
     * Smoothly scrolls the `messagesEndRef` div into view so the user always
     * sees the latest message or the "Thinking..." indicator without manually
     * scrolling down.
     */
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isWaitingForAI])

    /**
     * `selectedChat` — derived value: the full chat object whose `id` matches
     * `selectedChatId`. Used in the right panel header (title, status badge,
     * message count) and to pass `chatId` / `title` to `<DeleteChat>`.
     * `undefined` when no chat is selected.
     */
    const selectedChat = chats.find((c) => c.id === selectedChatId)

    /**
     * `filteredChats` — derived value: subset of `chats` that match the
     * current `search` string. Matches against both the chat title and the
     * content of the first message (preview text shown in the sidebar).
     * Re-computed on every render when `chats` or `search` changes.
     */
    const filteredChats = chats.filter((chat) =>
        chat.title.toLowerCase().includes(search.toLowerCase()) ||
        (chat.messages[0]?.content ?? '').toLowerCase().includes(search.toLowerCase())
    )

    /**
     * `handleNewChat` — creates a new chat via the `startChat` mutation and
     * immediately selects it so the right panel opens the fresh conversation.
     * Memoised with `useCallback` to avoid re-creating the function on every
     * render; only recreated when `agentId` or `startChat` changes.
     *
     * @example
     * // Triggered by the "+" icon button in the sidebar header
     * <Button onClick={handleNewChat} />
     */
    const handleNewChat = useCallback(async () => {
        const chat = await startChat.mutateAsync({ id: agentId })
        setSelectedChatId(chat.id)
    }, [agentId, startChat])

    /**
     * `handleSend` — validates and submits the current `messageInput`.
     * Guards against empty input, no selected chat, or an in-flight send.
     * Clears the input field optimistically before awaiting the mutation so
     * the UI feels instant. Delegates actual API call to `send` from `useAIChat`.
     * Memoised with `useCallback`; recreated when any dependency changes.
     *
     * @example
     * // Triggered by the Send button click or Enter key in the input field
     * <Button onClick={handleSend} />
     * <Input onKeyDown={(e) => e.key === 'Enter' && handleSend()} />
     */
    const handleSend = useCallback(async () => {
        if (!messageInput.trim() || !selectedChatId || isSending) return
        const content = messageInput.trim()
        setMessageInput('')
        await send(content, selectedChatId)
    }, [messageInput, selectedChatId, isSending, send])

    return (
        
        <section className="flex h-[600px] rounded-lg border overflow-hidden">
            {/* Chat Sidebar */}
            <div className="w-[320px] flex-none border-r flex flex-col overflow-hidden">
                <div className="p-3 border-b flex items-center justify-between gap-2">
                    <div className="relative flex-1">
                        <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Search chats..."
                            className="pl-8 h-9 text-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        className="size-9 flex-none"
                        onClick={handleNewChat}
                        disabled={startChat.isPending}
                    >
                        {startChat.isPending ? <LoaderIcon className="size-4 animate-spin" /> : <PlusIcon className="size-4" />}
                    </Button>
                </div>

                <ScrollArea className="flex-1 min-h-0">
                    <div className="flex flex-col">
                        {chatsLoading ? (
                            <div className="flex items-center justify-center py-10">
                                <LoaderIcon className="size-5 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <>
                                {filteredChats.map((chat) => (
                                    <button
                                        type="button"
                                        key={chat.id}
                                        onClick={() => setSelectedChatId(chat.id)}
                                        className={`flex flex-col gap-1 px-4 py-3 text-left transition-colors hover:bg-muted/50 border-b last:border-b-0 ${chat.id === selectedChatId ? 'bg-muted/60' : ''}`}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className={`text-sm font-medium truncate ${chat.id === selectedChatId ? 'text-primary' : 'text-foreground'}`}>
                                                {chat.title}
                                            </span>
                                            <span className="text-[11px] text-muted-foreground flex-none">
                                                {formatRelativeDate(chat.updatedAt)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {chat.messages[0]?.content ?? 'Start a new conversation...'}
                                        </p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <MessageCircleIcon className="size-3 text-muted-foreground/60" />
                                            <span className="text-[11px] text-muted-foreground/60">{chat._count.messages} messages</span>
                                        </div>
                                    </button>
                                ))}

                                {filteredChats.length === 0 && (
                                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                                        No chats found.
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Chat Content */}
            <div className="flex-1 flex flex-col">
                {selectedChat ? (
                    <>
                        {/* Chat Header */}
                        <div className="px-5 py-3 border-b flex items-center justify-between">
                            <div className="flex flex-col">
                                <h3 className="text-sm font-semibold">{selectedChat.title}</h3>
                                <span className="text-xs text-muted-foreground">{selectedChat._count.messages} messages · {formatRelativeDate(selectedChat.updatedAt)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge
                                    variant="outline"
                                    className={`text-[11px] ${selectedChat.status === 'resolved'
                                        ? 'border-blue-200 bg-blue-50 text-blue-700'
                                        : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                        }`}
                                >
                                    <span className={`size-1.5 rounded-full mr-1 ${selectedChat.status === 'resolved' ? 'bg-blue-500' : 'bg-emerald-500'
                                        }`} />
                                    {selectedChat.status === 'resolved' ? 'Resolved' : 'Active'}
                                </Badge>
                                <DeleteChat title={selectedChat.title} chatId={selectedChat.id}>

                                    <Button variant="destructive" size="icon-sm" >
                                        <Trash2 />
                                    </Button>
                                </DeleteChat>
                            </div>
                        </div>

                        {/* Messages */}
                        <ScrollArea className="flex-1 min-h-0 px-5 py-4">
                            <div className="flex flex-col gap-4 max-w-3xl">
                                {messagesLoading ? (
                                    <div className="flex items-center justify-center py-20">
                                        <LoaderIcon className="size-5 animate-spin text-muted-foreground" />
                                    </div>
                                ) : messages.length > 0 ? (
                                    messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                                        >
                                            <Avatar className="size-8 flex-none mt-0.5">
                                                <AvatarFallback className={`text-xs font-semibold ${msg.role === 'assistant' ? 'bg-primary/10 text-primary' : 'bg-muted'}`}>
                                                    {msg.role === 'assistant' ? 'AI' : 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className={`flex flex-col gap-1 max-w-[80%] ${msg.role === 'user' ? 'items-end' : ''}`}>
                                                <div className={`rounded-xl px-4 py-2.5 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                                    {msg.role === 'assistant' ? (
                                                        <ReactMarkdown
                                                            components={{
                                                                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                                                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                                                                ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                                                                ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                                                                li: ({ children }) => <li>{children}</li>,
                                                                code: ({ children }) => <code className="bg-black/10 dark:bg-white/10 rounded px-1 py-0.5 font-mono text-xs">{children}</code>,
                                                                pre: ({ children }) => <pre className="bg-black/10 dark:bg-white/10 rounded p-2 my-2 overflow-x-auto font-mono text-xs">{children}</pre>,
                                                            }}
                                                        >
                                                            {msg.content}
                                                        </ReactMarkdown>
                                                    ) : (
                                                        msg.content
                                                    )}
                                                </div>
                                                <span className="text-[11px] text-muted-foreground px-1">
                                                    {new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                                        <MessageCircleIcon className="size-10 text-muted-foreground/30 mb-3" />
                                        <p className="text-sm font-medium text-muted-foreground">No messages yet</p>
                                        <p className="text-xs text-muted-foreground/60 mt-1">Start the conversation with your agent</p>
                                    </div>
                                )}
                                {isWaitingForAI && (
                                    <div className="flex gap-3">
                                        <Avatar className="size-8 flex-none mt-0.5">
                                            <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">AI</AvatarFallback>
                                        </Avatar>
                                        <div className="rounded-xl px-4 py-2.5 bg-muted flex items-center gap-2">
                                            <LoaderIcon className="size-3.5 animate-spin text-muted-foreground" />
                                            <span className="text-sm text-muted-foreground">Thinking...</span>
                                        </div>
                                    </div>
                                )}
                                {/* Scroll anchor */}
                                <div ref={messagesEndRef} />
                            </div>
                        </ScrollArea>

                        {/* Input Area */}
                        <div className="p-4 border-t">
                            <div className="flex items-center gap-2 max-w-3xl">
                                <Input
                                    placeholder="Type a message..."
                                    className="flex-1 h-10"
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                                    disabled={isSending || isWaitingForAI}
                                />
                                <Button
                                    size="icon"
                                    className="size-10 flex-none"
                                    onClick={handleSend}
                                    disabled={!messageInput.trim() || isSending || isWaitingForAI}
                                >
                                    {isSending || isWaitingForAI ? <LoaderIcon className="size-4 animate-spin" /> : <SendIcon className="size-4" />}
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-1 items-center justify-center">
                        <div className="text-center">
                            <MessageCircleIcon className="size-12 text-muted-foreground/30 mx-auto mb-3" />
                            <p className="text-sm font-medium text-muted-foreground">Select a chat to view</p>
                            <p className="text-xs text-muted-foreground/60 mt-1">Or create a new one with the + button</p>
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}

import { useState, useCallback, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { SearchIcon, PlusIcon, MessageCircleIcon, MoreHorizontalIcon, SendIcon, LoaderIcon, Trash2 } from 'lucide-react'
import { useAgentChats, useChatMessages, useStartChat, useSendMessage } from '../hooks/use-agents'
import { useParams } from 'next/navigation'

import { formatRelativeDate } from '@/lib/utils'
import { DeleteChat } from './delete-chat'



export const ChatsSection = () => {
    const { id: agentId } = useParams<{ id: string }>()
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
    const [search, setSearch] = useState('')
    const [messageInput, setMessageInput] = useState('')
    const [isWaitingForAI, setIsWaitingForAI] = useState(false)
    const sentMessageCountRef = useRef(0)

    const { data: chats = [], isLoading: chatsLoading } = useAgentChats()
    const { data: messages = [], isLoading: messagesLoading } = useChatMessages(
        selectedChatId,
        isWaitingForAI ? 2000 : false
    )
    const startChat = useStartChat()
    const sendMessage = useSendMessage(selectedChatId)

    // Stop polling once a new assistant message appears after we sent
    useEffect(() => {
        if (!isWaitingForAI) return
        if (messages.length > sentMessageCountRef.current && messages[messages.length - 1]?.role === 'assistant') {
            setIsWaitingForAI(false)
        }
    }, [messages, isWaitingForAI])

    const selectedChat = chats.find((c) => c.id === selectedChatId)

    const filteredChats = chats.filter((chat) =>
        chat.title.toLowerCase().includes(search.toLowerCase()) ||
        (chat.messages[0]?.content ?? '').toLowerCase().includes(search.toLowerCase())
    )

    const handleNewChat = useCallback(async () => {
        const chat = await startChat.mutateAsync({ id: agentId })
        setSelectedChatId(chat.id)
    }, [agentId, startChat])

    const handleSend = useCallback(async () => {
        if (!messageInput.trim() || !selectedChatId || sendMessage.isPending) return
        const content = messageInput.trim()
        setMessageInput('')
        sentMessageCountRef.current = messages.length + 1 // +1 for the user message about to be saved
        await sendMessage.mutateAsync({ id: agentId, chatId: selectedChatId, content })
        setIsWaitingForAI(true)
    }, [messageInput, selectedChatId, agentId, sendMessage, messages.length])

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
                                    disabled={sendMessage.isPending || isWaitingForAI}
                                />
                                <Button
                                    size="icon"
                                    className="size-10 flex-none"
                                    onClick={handleSend}
                                    disabled={!messageInput.trim() || sendMessage.isPending || isWaitingForAI}
                                >
                                    {sendMessage.isPending || isWaitingForAI ? <LoaderIcon className="size-4 animate-spin" /> : <SendIcon className="size-4" />}
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

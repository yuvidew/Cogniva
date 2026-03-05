import { useState, useCallback, useRef } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { SearchIcon, PlusIcon, MessageCircleIcon, MoreHorizontalIcon, SendIcon } from 'lucide-react'


type ChatItem = {
    id: string
    title: string
    date: string
    preview: string
    messages: number
    status: 'active' | 'resolved'
}

type Message = {
    id: string
    role: 'user' | 'assistant'
    content: string
    time: string
}

const initialChats: ChatItem[] = [
    { id: '1', title: 'Product pricing inquiry', date: 'Today', preview: 'Can you tell me about pricing for the enterprise plan?', messages: 12, status: 'resolved' },
    { id: '2', title: 'Demo booking request', date: 'Today', preview: 'I would like to schedule a product demo for our team.', messages: 8, status: 'resolved' },
    { id: '3', title: 'Feature comparison help', date: 'Yesterday', preview: 'How does your product compare to competitors?', messages: 15, status: 'resolved' },
    { id: '4', title: 'Onboarding assistance', date: 'Yesterday', preview: 'We just signed up and need help getting started.', messages: 22, status: 'resolved' },
    { id: '5', title: 'Integration questions', date: 'Mar 02', preview: 'Do you support Salesforce integration?', messages: 6, status: 'active' },
    { id: '6', title: 'Billing issue resolution', date: 'Mar 01', preview: 'There seems to be an issue with our last invoice.', messages: 9, status: 'resolved' },
    { id: '7', title: 'Custom plan negotiation', date: 'Feb 28', preview: 'We need a custom plan for 500+ users.', messages: 18, status: 'active' },
    { id: '8', title: 'API access request', date: 'Feb 27', preview: 'How can we get API access for our developers?', messages: 4, status: 'resolved' },
    { id: '9', title: 'Renewal discussion', date: 'Feb 25', preview: 'Our annual plan is expiring next month.', messages: 11, status: 'active' },
    { id: '10', title: 'Technical support query', date: 'Feb 24', preview: 'We are facing issues with the webhook setup.', messages: 7, status: 'resolved' },
    { id: '11', title: 'Webhook setup issue', date: 'Feb 24', preview: 'We are facing issues with the webhook setup.', messages: 7, status: 'resolved' },
]

const chatMessagesMap: Record<string, Message[]> = {
    '1': [
        { id: '1', role: 'user', content: 'Can you tell me about pricing for the enterprise plan?', time: '10:30 AM' },
        { id: '2', role: 'assistant', content: 'Of course! Our Enterprise plan starts at $99/user/month with volume discounts available for teams of 50+. It includes:\n\n• Unlimited AI conversations\n• Priority support (< 1hr response)\n• Custom model fine-tuning\n• SSO & advanced security\n• Dedicated account manager\n\nWould you like me to schedule a call with our sales team to discuss a custom quote for your organization?', time: '10:30 AM' },
        { id: '3', role: 'user', content: 'That sounds great. How does it compare to the Pro plan?', time: '10:32 AM' },
        { id: '4', role: 'assistant', content: 'Great question! Here\'s a quick comparison:\n\n**Pro Plan ($29/user/mo)**\n- 1,000 AI conversations/mo\n- Standard support\n- Basic analytics\n\n**Enterprise Plan ($99/user/mo)**\n- Unlimited conversations\n- Priority support\n- Advanced analytics & reporting\n- Custom integrations\n- SLA guarantee (99.9% uptime)\n\nThe Enterprise plan is ideal for teams that need high-volume usage and dedicated support. Would you like me to book a demo?', time: '10:33 AM' },
    ],
    '2': [
        { id: '1', role: 'user', content: 'I would like to schedule a product demo for our team.', time: '2:15 PM' },
        { id: '2', role: 'assistant', content: 'I\'d be happy to help you schedule a demo! To find the best time, could you let me know:\n\n1. How many team members will attend?\n2. What timezone are you in?\n3. Do you prefer mornings or afternoons?\n\nWe have slots available this week on Wednesday and Thursday.', time: '2:15 PM' },
        { id: '3', role: 'user', content: 'We have 5 people. We are in EST. Afternoons work best.', time: '2:18 PM' },
        { id: '4', role: 'assistant', content: 'I\'ve scheduled a demo for Thursday at 2:00 PM EST for your team of 5. You\'ll receive a calendar invite shortly with the meeting link. Is there anything specific you\'d like us to cover during the demo?', time: '2:18 PM' },
    ],
    '3': [
        { id: '1', role: 'user', content: 'How does your product compare to competitors?', time: '9:00 AM' },
        { id: '2', role: 'assistant', content: 'Great question! Here\'s what sets us apart:\n\n**vs. Competitor A:**\n- 3x faster response time\n- More accurate AI responses\n- Better integration ecosystem\n\n**vs. Competitor B:**\n- 50% lower cost at scale\n- Built-in analytics dashboard\n- No per-message fees\n\nWould you like a detailed side-by-side comparison document?', time: '9:01 AM' },
    ],
}

export const ChatsSection = () => {
    const [chats, setChats] = useState<ChatItem[]>(initialChats)
    const [selectedChatId, setSelectedChatId] = useState<string>('1')

    // TODO: if i search something then show in url
    const [search, setSearch] = useState('')

    const selectedChat = chats.find((c) => c.id === selectedChatId)
    const messages = chatMessagesMap[selectedChatId] ?? []

    const filteredChats = chats.filter((chat) =>
        chat.title.toLowerCase().includes(search.toLowerCase()) ||
        chat.preview.toLowerCase().includes(search.toLowerCase())
    )

    const handleNewChat = useCallback(() => {
        const newId = String(Date.now())
        const newChat: ChatItem = {
            id: newId,
            title: 'New conversation',
            date: 'Just now',
            preview: 'Start a new conversation with the agent...',
            messages: 0,
            status: 'active',
        }
        setChats((prev) => [newChat, ...prev])
        setSelectedChatId(newId)
    }, [])

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
                    <Button variant="outline" size="icon" className="size-9 flex-none" onClick={handleNewChat}>
                        <PlusIcon className="size-4" />
                    </Button>
                </div>

                <ScrollArea className="flex-1 min-h-0">
                    <div className="flex flex-col">
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
                                        {chat.date}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground truncate">
                                    {chat.preview}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <MessageCircleIcon className="size-3 text-muted-foreground/60" />
                                    <span className="text-[11px] text-muted-foreground/60">{chat.messages} messages</span>
                                </div>
                            </button>
                        ))}

                        {filteredChats.length === 0 && (
                            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                                No chats found.
                            </div>
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
                                <span className="text-xs text-muted-foreground">{selectedChat.messages} messages · {selectedChat.date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge
                                    variant="outline"
                                    className={`text-[11px] ${
                                        selectedChat.status === 'resolved'
                                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                            : 'border-blue-200 bg-blue-50 text-blue-700'
                                    }`}
                                >
                                    <span className={`size-1.5 rounded-full mr-1 ${
                                        selectedChat.status === 'resolved' ? 'bg-emerald-500' : 'bg-blue-500'
                                    }`} />
                                    {selectedChat.status === 'resolved' ? 'Resolved' : 'Active'}
                                </Badge>
                                <Button variant="ghost" size="icon" className="size-8">
                                    <MoreHorizontalIcon className="size-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Messages */}
                        <ScrollArea className="flex-1 min-h-0 px-5 py-4">
                            <div className="flex flex-col gap-4 max-w-3xl">
                                {messages.length > 0 ? (
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
                                                <div className={`rounded-xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                                    {msg.content}
                                                </div>
                                                <span className="text-[11px] text-muted-foreground px-1">{msg.time}</span>
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
                            </div>
                        </ScrollArea>

                        {/* Input Area */}
                        <div className="p-4 border-t">
                            <div className="flex items-center gap-2 max-w-3xl">
                                <Input
                                    placeholder="Type a message..."
                                    className="flex-1 h-10"
                                />
                                <Button size="icon" className="size-10 flex-none">
                                    <SendIcon className="size-4" />
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
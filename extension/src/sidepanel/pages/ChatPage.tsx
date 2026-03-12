import { useEffect, useRef, useState, useCallback } from "react";
import {
    ArrowLeft, Send, Loader2, Globe, TextSelect,
    BotIcon, FileText, X,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { createChat, fetchMessages, sendMessage } from "@/lib/api";
import type { Agent, Chat, Message, PageContext } from "@/lib/types";

const POLL_INTERVAL_MS = 2_000;

interface Props {
    agent: Agent | null;
    resumeChat: Chat | null;
    onBack: () => void;
}

export function ChatPage({ agent, resumeChat, onBack }: Props) {
    const [chat,       setChat]       = useState<Chat | null>(resumeChat);
    const [messages,   setMessages]   = useState<Message[]>([]);
    const [input,      setInput]      = useState("");
    const [pageCtx,    setPageCtx]    = useState<PageContext | null>(null);
    const [attachCtx,  setAttachCtx]  = useState(false);
    const [isWaiting,  setIsWaiting]  = useState(false);
    const [isSending,  setIsSending]  = useState(false);
    const [error,      setError]      = useState<string | null>(null);

    const bottomRef  = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const pollRef    = useRef<ReturnType<typeof setInterval> | null>(null);

    // ── Pull latest page context from session storage ─────────────────────────
    useEffect(() => {
        chrome.storage.session.get("pageContext").then((r) => {
            if (r.pageContext) setPageCtx(r.pageContext as PageContext);
        });

        const listener = (changes: Record<string, chrome.storage.StorageChange>) => {
            if (changes.pageContext?.newValue)
                setPageCtx(changes.pageContext.newValue as PageContext);
        };
        chrome.storage.session.onChanged.addListener(listener);
        return () => chrome.storage.session.onChanged.removeListener(listener);
    }, []);

    // ── Init: create or reuse chat ────────────────────────────────────────────
    useEffect(() => {
        if (!agent) return;
        if (chat) {
            loadMessages(chat.id);
        } else {
            createChat(agent.id)
                .then((c) => { setChat(c); setMessages([]); })
                .catch((e: Error) => setError(e.message));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [agent]);

    // ── Auto scroll ───────────────────────────────────────────────────────────
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isWaiting]);

    // Cleanup polling on unmount
    useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

    // ── Load messages ─────────────────────────────────────────────────────────
    const loadMessages = useCallback(async (chatId: string) => {
        try {
            const msgs = await fetchMessages(chatId);
            setMessages(msgs);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load messages");
        }
    }, []);

    // ── Poll until AI replies ─────────────────────────────────────────────────
    const startPolling = useCallback((chatId: string, prevCount: number) => {
        setIsWaiting(true);
        if (pollRef.current) clearInterval(pollRef.current);

        pollRef.current = setInterval(async () => {
            try {
                const msgs = await fetchMessages(chatId);
                const last  = msgs[msgs.length - 1];
                if (msgs.length > prevCount && last?.role === "assistant") {
                    setMessages(msgs);
                    setIsWaiting(false);
                    clearInterval(pollRef.current!);
                }
            } catch { /* silently retry */ }
        }, POLL_INTERVAL_MS);
    }, [loadMessages]);

    // ── Send ──────────────────────────────────────────────────────────────────
    const handleSend = async () => {
        const content = input.trim();
        if (!content || !chat || isSending || isWaiting) return;

        setError(null);
        setInput("");
        // Auto-resize textarea back
        if (textareaRef.current) textareaRef.current.style.height = "auto";
        setIsSending(true);

        const ctx: PageContext | undefined =
            attachCtx && pageCtx ? pageCtx : undefined;

        try {
            const userMsg = await sendMessage(chat.id, content, ctx);
            setMessages((prev) => [...prev, userMsg]);
            startPolling(chat.id, messages.length + 1);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to send message");
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        // Auto-grow textarea
        e.target.style.height = "auto";
        e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
    };

    const visibleMessages = messages.filter((m) => m.role !== "system");

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col h-screen bg-zinc-950">

            {/* ── Header ───────────────────────────────────────────────── */}
            <header className="flex items-center gap-2.5 px-3 py-2.5 border-b border-zinc-800 shrink-0">
                <button
                    onClick={onBack}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>

                <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center text-xs font-bold text-white shrink-0 overflow-hidden">
                    {agent?.avatar ? (
                        <span className="text-base leading-none">{agent.avatar}</span>
                    ) : (
                        <BotIcon className="w-4 h-4" />
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate leading-none">
                        {agent?.name ?? "Agent"}
                    </p>
                    {pageCtx && (
                        <p className="text-xs text-zinc-500 truncate mt-0.5">{pageCtx.title}</p>
                    )}
                </div>
            </header>

            {/* ── Page context banner ───────────────────────────────────── */}
            {pageCtx && (
                <div className="mx-3 mt-2 px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-start gap-2.5 shrink-0">
                    <div className="shrink-0 mt-0.5">
                        {pageCtx.selectedText
                            ? <TextSelect className="w-3.5 h-3.5 text-blue-400" />
                            : <Globe      className="w-3.5 h-3.5 text-zinc-400" />
                        }
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-zinc-300 truncate">{pageCtx.title}</p>
                        {pageCtx.selectedText ? (
                            <p className="text-xs text-zinc-500 truncate mt-0.5 italic">
                                &ldquo;{pageCtx.selectedText.slice(0, 70)}{pageCtx.selectedText.length > 70 ? "…" : ""}&rdquo;
                            </p>
                        ) : pageCtx.fullText ? (
                            <p className="text-xs text-zinc-600 mt-0.5">Full page text available</p>
                        ) : null}
                    </div>
                    <label className="flex items-center gap-1.5 shrink-0 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={attachCtx}
                            onChange={(e) => setAttachCtx(e.target.checked)}
                            className="accent-blue-500 w-3.5 h-3.5"
                        />
                        <span className="text-xs text-zinc-400">Attach</span>
                    </label>
                </div>
            )}

            {/* ── Messages ─────────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-3">

                {visibleMessages.length === 0 && !isWaiting && (
                    <div className="flex flex-col items-center gap-3 py-12 text-zinc-600">
                        <BotIcon className="w-10 h-10 text-zinc-800" />
                        <p className="text-sm font-medium text-zinc-500">
                            Start chatting with {agent?.name}
                        </p>
                        {pageCtx && !attachCtx && (
                            <p className="text-xs text-center text-zinc-600">
                                Tick <strong className="text-zinc-500">Attach</strong> above to share the page context.
                            </p>
                        )}
                        {/* Quick action chips */}
                        {pageCtx && (
                            <div className="flex flex-wrap gap-2 justify-center mt-1">
                                {[
                                    "Summarize this page",
                                    "Explain the key points",
                                    "Extract action items",
                                ].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => { setInput(s); setAttachCtx(true); textareaRef.current?.focus(); }}
                                        className="text-xs px-3 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 transition-colors"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {visibleMessages.map((m) => (
                    <MessageBubble key={m.id} message={m} />
                ))}

                {isWaiting && (
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-zinc-800 rounded-bl-sm w-fit">
                        <span className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                                <span
                                    key={i}
                                    className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce"
                                    style={{ animationDelay: `${i * 150}ms` }}
                                />
                            ))}
                        </span>
                        <span className="text-xs text-zinc-400">Thinking…</span>
                    </div>
                )}

                {error && (
                    <div className="flex items-start gap-2 text-xs text-red-400 bg-red-950/30 border border-red-900/40 rounded-xl px-3 py-2.5">
                        <X className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        {error}
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            {/* ── Input bar ────────────────────────────────────────────── */}
            <div className="px-3 pb-3 pt-2 border-t border-zinc-800 shrink-0">
                {attachCtx && pageCtx && (
                    <div className="flex items-center gap-1.5 mb-2 px-1">
                        <FileText className="w-3 h-3 text-blue-400 shrink-0" />
                        <span className="text-xs text-blue-400 truncate flex-1">
                            {pageCtx.selectedText ? "Selected text" : "Full page"} attached
                        </span>
                        <button onClick={() => setAttachCtx(false)} className="text-zinc-500 hover:text-zinc-300">
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                )}

                <div className="flex items-end gap-2">
                    <textarea
                        ref={textareaRef}
                        rows={1}
                        value={input}
                        onChange={handleInput}
                        onKeyDown={handleKeyDown}
                        placeholder={
                            attachCtx && pageCtx?.selectedText
                                ? `Ask about "${pageCtx.selectedText.slice(0, 25)}…"`
                                : "Ask your agent anything…"
                        }
                        disabled={isSending || isWaiting || !chat}
                        className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 resize-none disabled:opacity-40 transition leading-relaxed overflow-hidden"
                        style={{ height: "auto", maxHeight: "120px" }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isSending || isWaiting || !chat}
                        className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0 shadow-md shadow-blue-600/20"
                    >
                        {isSending
                            ? <Loader2 className="w-4 h-4 animate-spin text-white" />
                            : <Send className="w-4 h-4 text-white" />
                        }
                    </button>
                </div>

                <p className="text-[10px] text-zinc-700 text-center mt-2">
                    Enter to send · Shift+Enter for new line
                </p>
            </div>
        </div>
    );
}

// ── MessageBubble ─────────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: Message }) {
    const isUser = message.role === "user";

    // Strip injected page context from display (lines after ---)
    const displayContent = isUser
        ? message.content.replace(/\n\n---\n[\s\S]*$/, "").trim()
        : message.content;

    const time = new Date(message.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <div className={`flex ${isUser ? "justify-end" : "justify-start"} gap-2`}>
            {!isUser && (
                <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center shrink-0 mt-auto mb-1">
                    <BotIcon className="w-3.5 h-3.5 text-white" />
                </div>
            )}

            <div className={`max-w-[82%] flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
                <div
                    className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isUser
                            ? "bg-blue-600 text-white rounded-br-sm"
                            : "bg-zinc-800 text-zinc-100 rounded-bl-sm"
                    }`}
                >
                    {isUser ? (
                        <p className="whitespace-pre-wrap break-words">{displayContent}</p>
                    ) : (
                        <div className="prose-ext break-words">
                            <ReactMarkdown>{displayContent}</ReactMarkdown>
                        </div>
                    )}
                </div>
                <span className="text-[10px] text-zinc-600 px-1">{time}</span>
            </div>
        </div>
    );
}

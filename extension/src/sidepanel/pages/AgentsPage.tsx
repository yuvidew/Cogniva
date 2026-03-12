import { useEffect, useState } from "react";
import { ZapIcon, BotIcon, LogOut, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { fetchAgents } from "@/lib/api";
import type { Agent, ExtUser } from "@/lib/types";

interface Props {
    user: ExtUser | null;
    onAgentSelect: (agent: Agent) => void;
    onSignOut: () => void;
}

function initials(name: string) {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

const MODEL_LABELS: Record<string, string> = {
    openai:     "OpenAI",
    anthropic:  "Anthropic",
    google:     "Google",
};

export function AgentsPage({ user, onAgentSelect, onSignOut }: Props) {
    const [agents,  setAgents]  = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState<string | null>(null);

    const load = () => {
        setLoading(true);
        setError(null);
        fetchAgents()
            .then(setAgents)
            .catch((e: Error) => setError(e.message))
            .finally(() => setLoading(false));
    };

    useEffect(load, []);

    return (
        <div className="flex flex-col h-screen bg-zinc-950">
            {/* ── Header ─────────────────────────────────────────────────── */}
            <header className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800 shrink-0">
                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
                    <ZapIcon className="w-4 h-4 text-white" fill="white" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white leading-none">Cogniva</p>
                    <p className="text-xs text-zinc-500 truncate mt-0.5">{user?.email}</p>
                </div>
                <button
                    onClick={onSignOut}
                    title="Sign out"
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                </button>
            </header>

            {/* ── Agent list ────────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between px-1 mb-1">
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
                        Your Agents
                    </p>
                    <button
                        onClick={load}
                        disabled={loading}
                        className="text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-40"
                        title="Refresh"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                    </button>
                </div>

                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
                    </div>
                )}

                {!loading && error && (
                    <div className="flex items-start gap-2 text-sm text-red-400 bg-red-950/30 border border-red-900/40 rounded-xl px-3 py-2.5">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                {!loading && !error && agents.length === 0 && (
                    <div className="flex flex-col items-center gap-3 py-12 text-zinc-500">
                        <BotIcon className="w-10 h-10 text-zinc-700" />
                        <p className="text-sm font-medium">No agents yet</p>
                        <p className="text-xs text-center text-zinc-600">
                            Create agents in your Cogniva dashboard, then come back here.
                        </p>
                    </div>
                )}

                {!loading && agents.map((agent) => (
                    <button
                        key={agent.id}
                        onClick={() => onAgentSelect(agent)}
                        className="group flex items-center gap-3 w-full px-3 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition-all text-left"
                    >
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center shrink-0 text-sm font-bold text-white overflow-hidden">
                            {agent.avatar ? (
                                <span className="text-xl leading-none">{agent.avatar}</span>
                            ) : (
                                initials(agent.name)
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate leading-tight">
                                {agent.name}
                            </p>
                            <p className="text-xs text-zinc-400 truncate mt-0.5">
                                {agent.description}
                            </p>
                            <span className="inline-block mt-1 text-[10px] text-zinc-600 bg-zinc-800 rounded px-1.5 py-0.5">
                                {MODEL_LABELS[agent.model] ?? agent.model}
                            </span>
                        </div>

                        <svg className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                ))}
            </div>
        </div>
    );
}

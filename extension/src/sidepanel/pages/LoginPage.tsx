import { useState } from "react";
import { ZapIcon, Loader2, Eye, EyeOff } from "lucide-react";
import { signIn } from "@/lib/api";
import { saveAuth } from "@/lib/auth";
import type { ExtUser } from "@/lib/types";

interface Props {
    onSignedIn: (token: string, user: ExtUser) => void;
}

export function LoginPage({ onSignedIn }: Props) {
    const [email,    setEmail]    = useState("");
    const [password, setPassword] = useState("");
    const [showPwd,  setShowPwd]  = useState(false);
    const [loading,  setLoading]  = useState(false);
    const [error,    setError]    = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const { token, user } = await signIn(email, password);
            await saveAuth(token, user);
            onSignedIn(token, user);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Sign-in failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen gap-7 px-5 py-8 bg-zinc-950">
            {/* Brand */}
            <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
                    <ZapIcon className="w-7 h-7 text-white" fill="white" />
                </div>
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white tracking-tight">Cogniva</h1>
                    <p className="text-sm text-zinc-400 mt-0.5">Sign in to use your AI agents</p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
                <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full px-3.5 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition disabled:opacity-50"
                />

                <div className="relative">
                    <input
                        type={showPwd ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        className="w-full px-3.5 py-3 pr-10 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition disabled:opacity-50"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPwd((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                        tabIndex={-1}
                    >
                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>

                {error && (
                    <div className="text-xs text-red-400 bg-red-950/40 border border-red-900/60 rounded-xl px-3.5 py-2.5">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading || !email || !password}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-sm font-semibold text-white transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-600/20"
                >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {loading ? "Signing in…" : "Sign In"}
                </button>
            </form>

            <p className="text-xs text-zinc-600 text-center">
                Don't have an account?{" "}
                <a href="http://localhost:3000/sign-up" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
                    Sign up on Cogniva
                </a>
            </p>
        </div>
    );
}

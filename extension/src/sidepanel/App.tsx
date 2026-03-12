import { useEffect, useState } from "react";
import { getToken, getStoredUser, clearAuth } from "@/lib/auth";
import type { ExtUser, Agent, Chat } from "@/lib/types";
import { LoginPage }  from "./pages/LoginPage";
import { AgentsPage } from "./pages/AgentsPage";
import { ChatPage }   from "./pages/ChatPage";

type View = "login" | "agents" | "chat";

/**
 * Top-level router for the extension side panel.
 * Three views: Login → Agents → Chat
 */
export function App() {
    const [view,          setView]          = useState<View>("login");
    const [user,          setUser]          = useState<ExtUser | null>(null);
    const [selectedAgent, setSelectedAgent] = useState<Agent  | null>(null);
    const [resumeChat,    setResumeChat]    = useState<Chat   | null>(null);

    // Restore session on mount
    useEffect(() => {
        getToken().then(async (token) => {
            if (!token) return;
            const u = await getStoredUser();
            if (u) { setUser(u); setView("agents"); }
        });
    }, []);

    const handleSignedIn = (_token: string, u: ExtUser) => {
        setUser(u);
        setView("agents");
    };

    const handleSignOut = async () => {
        await clearAuth();
        setUser(null);
        setSelectedAgent(null);
        setResumeChat(null);
        setView("login");
    };

    const handleAgentSelect = (agent: Agent) => {
        setSelectedAgent(agent);
        setResumeChat(null);
        setView("chat");
    };

    const handleBack = () => {
        setSelectedAgent(null);
        setResumeChat(null);
        setView("agents");
    };

    if (view === "login")
        return <LoginPage onSignedIn={handleSignedIn} />;

    if (view === "agents")
        return (
            <AgentsPage
                user={user}
                onAgentSelect={handleAgentSelect}
                onSignOut={handleSignOut}
            />
        );

    return (
        <ChatPage
            agent={selectedAgent}
            resumeChat={resumeChat}
            onBack={handleBack}
        />
    );
}

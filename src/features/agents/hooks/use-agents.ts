import { useTRPC } from "@/trpc/client";
import { useAgentsParams } from "./use-agents-params";
import { useMutation, useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { toast } from "sonner";

/** Hook to fetch agents with suspense */
export const useSuspenseAgents = () => {
    const trpc = useTRPC();
    const [params] = useAgentsParams();

    return useSuspenseQuery(trpc.agent.getMany.queryOptions(params));
}

/**Hook to fetch a single agent with suspense */
export const useSuspenseAgent = () => {
    const { id } = useParams<{ id: string }>();
    const trpc = useTRPC();

    return useSuspenseQuery(trpc.agentById.getOne.queryOptions({ id }));
}

/**Hook to fetch agent overview  */
export const useAgentOverview = () => {
    const { id } = useParams<{ id: string }>();
    const trpc = useTRPC();

    return useQuery(trpc.agentById.getOverView.queryOptions({ id }));
}

/** Hook to fetch all chats for an agent */
export const useAgentChats = () => {
    const { id } = useParams<{ id: string }>();
    const trpc = useTRPC();

    return useQuery(trpc.agentById.getChats.queryOptions({ id }));
}

/** Hook to fetch messages for a specific chat */
export const useChatMessages = (chatId: string | null, refetchInterval?: number | false) => {
    const { id } = useParams<{ id: string }>();
    const trpc = useTRPC();

    return useQuery({
        ...trpc.agentById.getMessages.queryOptions({ id, chatId: chatId ?? "" }),
        enabled: !!chatId,
        refetchInterval,
    });
}

/** Hook to start a new chat */
export const useStartChat = () => {
    const { id } = useParams<{ id: string }>();
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    return useMutation({
        ...trpc.agentById.startChat.mutationOptions(),
        onSuccess: () => {
            queryClient.invalidateQueries(trpc.agentById.getChats.queryOptions({ id }));
        },
        onError: (error) => {
            toast.error(error.message || "Failed to start chat");
        }
    });
}

/** Hook to send a message and get AI response */
export const useSendMessage = (chatId: string | null) => {
    const { id } = useParams<{ id: string }>();
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    return useMutation({
        ...trpc.agentById.sendMessage.mutationOptions(),
        onSuccess: () => {
            if (chatId) {
                queryClient.invalidateQueries(trpc.agentById.getMessages.queryOptions({ id, chatId }));
                queryClient.invalidateQueries(trpc.agentById.getChats.queryOptions({ id }));
            }
        },
        onError: (error) => {
            toast.error(error.message || "Failed to send message");
        }
    });
}


/** Hook to delete a chat */
export const useDeleteChat = ( ) => {
    const { id } = useParams<{ id: string }>();
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    return useMutation({
        ...trpc.agentById.deleteChat.mutationOptions(),
        onSuccess: () => {
            queryClient.invalidateQueries(trpc.agentById.getChats.queryOptions({ id }));
            queryClient.invalidateQueries(trpc.agentById.getOne.queryOptions({ id }));
        },
        onError: (error) => {
            toast.error(error.message || "Failed to delete chat");
        }
    });
};

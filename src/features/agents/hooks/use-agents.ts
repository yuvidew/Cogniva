import { useTRPC } from "@/trpc/client";
import { useAgentsParams } from "./use-agents-params";
import { useMutation, useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState, useEffect, useRef, useCallback } from "react";

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

/**
 * Encapsulates the full AI chat interaction for a selected chat:
 * - Fetches messages with polling while waiting for AI
 * - Stops polling when the assistant reply arrives
 * - Invalidates the chat list so the AI-generated title appears immediately
 */
export const useAIChat = (selectedChatId: string | null) => {
    const { id } = useParams<{ id: string }>();
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const [isWaitingForAI, setIsWaitingForAI] = useState(false);
    const sentMessageCountRef = useRef(0);

    const { data: messages = [], isLoading: messagesLoading } = useQuery({
        ...trpc.agentById.getMessages.queryOptions({ id, chatId: selectedChatId ?? "" }),
        enabled: !!selectedChatId,
        refetchInterval: isWaitingForAI ? 2000 : false,
    });

    const sendMessage = useMutation({
        ...trpc.agentById.sendMessage.mutationOptions(),
        onError: (error) => {
            toast.error(error.message || "Failed to send message");
            setIsWaitingForAI(false);
        },
    });

    // Stop polling + refresh chat list once the new assistant message arrives
    useEffect(() => {
        if (!isWaitingForAI) return;
        if (
            messages.length > sentMessageCountRef.current &&
            messages[messages.length - 1]?.role === "assistant"
        ) {
            setIsWaitingForAI(false);
            queryClient.invalidateQueries(trpc.agentById.getChats.queryOptions({ id }));
        }
    }, [messages, isWaitingForAI, queryClient, trpc, id]);

    const send = useCallback(
        async (content: string, chatId: string) => {
            if (!content.trim() || sendMessage.isPending) return;
            sentMessageCountRef.current = messages.length + 1;
            await sendMessage.mutateAsync({ id, chatId, content });
            setIsWaitingForAI(true);
        },
        [id, messages.length, sendMessage]
    );

    return {
        messages,
        messagesLoading,
        isWaitingForAI,
        isSending: sendMessage.isPending,
        send,
    };
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

/** Hook to fetch all knowledge-base files for an agent */
export const useAgentFiles = () => {
    const { id } = useParams<{ id: string }>();
    const trpc = useTRPC();

    return useQuery(trpc.agentById.getFiles.queryOptions({ id }));
};

/** Hook to upload a file to the agent's knowledge base */
export const useUploadFile = () => {
    const { id } = useParams<{ id: string }>();
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    return useMutation({
        ...trpc.agentById.uploadFile.mutationOptions(),
        onSuccess: () => {
            queryClient.invalidateQueries(trpc.agentById.getFiles.queryOptions({ id }));
            queryClient.invalidateQueries(trpc.agentById.getOne.queryOptions({ id }));
            queryClient.invalidateQueries(trpc.agentById.getOverView.queryOptions({ id }));
            toast.success("File uploaded successfully");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to upload file");
        },
    });
};

/**
 * `useUpdateAgent` — mutation hook that calls the `update` tRPC procedure to
 * persist agent configuration changes (name, description, avatar, systemPrompt,
 * model, temperature, boolean toggles, etc.).
 *
 * On success:
 * - Invalidates `getOne` so the sidebar/header reflects the new name/avatar.
 * - Invalidates `getOverView` so the overview tab re-renders with the latest prompt.
 * - Shows a success toast.
 *
 * On error: shows an error toast with the server message.
 */
export const useUpdateAgent = () => {
    const { id } = useParams<{ id: string }>();
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    return useMutation({
        ...trpc.agentById.update.mutationOptions(),
        onSuccess: () => {
            queryClient.invalidateQueries(trpc.agentById.getOne.queryOptions({ id }));
            queryClient.invalidateQueries(trpc.agentById.getOverView.queryOptions({ id }));
            toast.success("Agent updated successfully");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update agent");
        },
    });
};

/** Hook to delete a knowledge-base file */
export const useDeleteFile = () => {
    const { id } = useParams<{ id: string }>();
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    return useMutation({
        ...trpc.agentById.deleteFile.mutationOptions(),
        onSuccess: () => {
            queryClient.invalidateQueries(trpc.agentById.getFiles.queryOptions({ id }));
            queryClient.invalidateQueries(trpc.agentById.getOne.queryOptions({ id }));
            toast.success("File deleted");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to delete file");
        },
    });
};


/** Hook to delete an agent */
export const useDeleteAgent = () => {
    const { id } = useParams<{ id: string }>();
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const navigate = useRouter()

    return useMutation({
        ...trpc.agentById.delete.mutationOptions(),
        onSuccess: () => {
            queryClient.invalidateQueries(trpc.agentById.getOne.queryOptions({ id }));
            queryClient.invalidateQueries(trpc.agentById.getOverView.queryOptions({ id }));
            queryClient.invalidateQueries(trpc.agent.getMany.queryOptions({}));
            toast.success("Agent deleted successfully");

            navigate.push("/agents");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to delete agent");
        },
    });
};

// ─── Image Processing Hooks ──────────────────────────────────────

/** Hook to fetch all processed images for an agent */
export const useAgentImages = () => {
    const { id } = useParams<{ id: string }>();
    const trpc = useTRPC();

    return useQuery(trpc.agentById.getImages.queryOptions({ id }));
};

/** Hook to upload an image for processing */
export const useUploadImage = () => {
    const { id } = useParams<{ id: string }>();
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    return useMutation({
        ...trpc.agentById.uploadImage.mutationOptions(),
        onSuccess: () => {
            queryClient.invalidateQueries(trpc.agentById.getImages.queryOptions({ id }));
            queryClient.invalidateQueries(trpc.agentById.getOne.queryOptions({ id }));
            toast.success("Image uploaded successfully");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to upload image");
        },
    });
};

/** Hook to delete a processed image */
export const useDeleteImage = () => {
    const { id } = useParams<{ id: string }>();
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    return useMutation({
        ...trpc.agentById.deleteImage.mutationOptions(),
        onSuccess: () => {
            queryClient.invalidateQueries(trpc.agentById.getImages.queryOptions({ id }));
            queryClient.invalidateQueries(trpc.agentById.getOne.queryOptions({ id }));
            toast.success("Image deleted");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to delete image");
        },
    });
};

// ─── Image Generation Hooks ──────────────────────────────────────

/** Hook to fetch all generated images for an agent */
export const useAgentGeneratedImages = () => {
    const { id } = useParams<{ id: string }>();
    const trpc = useTRPC();

    return useQuery(trpc.agentById.getGeneratedImages.queryOptions({ id }));
};

/** Hook to generate an image using AI */
export const useGenerateImage = () => {
    const { id } = useParams<{ id: string }>();
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    return useMutation({
        ...trpc.agentById.generateImage.mutationOptions(),
        onSuccess: () => {
            queryClient.invalidateQueries(trpc.agentById.getGeneratedImages.queryOptions({ id }));
            toast.success("Image generation started");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to generate image");
        },
    });
};

/** Hook to delete a generated image */
export const useDeleteGeneratedImage = () => {
    const { id } = useParams<{ id: string }>();
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    return useMutation({
        ...trpc.agentById.deleteGeneratedImage.mutationOptions(),
        onSuccess: () => {
            queryClient.invalidateQueries(trpc.agentById.getGeneratedImages.queryOptions({ id }));
            toast.success("Generated image deleted");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to delete generated image");
        },
    });
};

// ─── Video Processing Hooks ──────────────────────────────────────

/** Hook to fetch all processed videos for an agent */
export const useAgentVideos = () => {
    const { id } = useParams<{ id: string }>();
    const trpc = useTRPC();

    return useQuery({
        ...trpc.agentById.getVideos.queryOptions({ id }),
        refetchInterval: 3000, // Auto-refetch every 3 seconds to check processing status
    });
};

/** Hook to upload a video for processing */
export const useUploadVideo = () => {
    const { id } = useParams<{ id: string }>();
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    return useMutation({
        ...trpc.agentById.uploadVideo.mutationOptions(),
        onSuccess: () => {
            queryClient.invalidateQueries(trpc.agentById.getVideos.queryOptions({ id }));
            queryClient.invalidateQueries(trpc.agentById.getOne.queryOptions({ id }));
            toast.success("Video uploaded and processing started");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to upload video");
        },
    });
};

/** Hook to process a video from URL (YouTube, direct link, etc.) */
export const useProcessVideoUrl = () => {
    const { id } = useParams<{ id: string }>();
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    return useMutation({
        ...trpc.agentById.processVideoUrl.mutationOptions(),
        onSuccess: () => {
            queryClient.invalidateQueries(trpc.agentById.getVideos.queryOptions({ id }));
            queryClient.invalidateQueries(trpc.agentById.getOne.queryOptions({ id }));
            toast.success("Video processing started");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to process video URL");
        },
    });
};

/** Hook to delete a processed video */
export const useDeleteVideo = () => {
    const { id } = useParams<{ id: string }>();
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    return useMutation({
        ...trpc.agentById.deleteVideo.mutationOptions(),
        onSuccess: () => {
            queryClient.invalidateQueries(trpc.agentById.getVideos.queryOptions({ id }));
            queryClient.invalidateQueries(trpc.agentById.getOne.queryOptions({ id }));
            toast.success("Video deleted");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to delete video");
        },
    });
};

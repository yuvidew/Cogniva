import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner";

/** Hook: Creates a new agent */
export const useCreateAgent = () => {
    const queryClient = useQueryClient();
    const trpc = useTRPC();

    return useMutation(trpc.agent.create.mutationOptions({
        onSuccess: (data) => {
            toast.success("Agent created successfully!");
            queryClient.invalidateQueries(
                trpc.agent.getMany.queryOptions({})
            );

            queryClient.invalidateQueries(
                trpc.agent.getOne.queryOptions({ id: data.id })
            );
        },

        onError: (error) => {
            toast.error(`Failed to create Agent: ${error.message}`);
        },

    }));
}
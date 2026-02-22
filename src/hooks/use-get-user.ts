import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

export const useGetUser = () => {
    const trpc = useTRPC();

    return useQuery(trpc.getUsers.queryOptions());
};
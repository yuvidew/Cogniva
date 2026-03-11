"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

export const useProfile = () => {
    const trpc = useTRPC();
    return useQuery(trpc.profile.getUser.queryOptions());
};

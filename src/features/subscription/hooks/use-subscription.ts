import { authClient } from "@/lib/auth-client"
import { useQuery } from "@tanstack/react-query"


export const useSubscription = () => {
    return useQuery({
        queryKey : ["subscription"],
        queryFn : async() => {
            const res = await authClient.customer.state();

            if (res.error) {
                throw new Error(res.error.message ?? "Failed to fetch subscription state");
            }

            return res.data;
        },
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        staleTime: 0,
        retry: 2,
    });
};

export const useOrders = () => {
    return useQuery({
        queryKey: ["orders"],
        queryFn: async () => {
            const res = await authClient.customer.orders.list();

            if (res.error) {
                throw new Error(res.error.message ?? "Failed to fetch orders");
            }

            return res.data;
        },
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        staleTime: 0,
        retry: 2,
    });
};

export const useHasActiveSubscription = () => {
    const {data: customerState , isLoading , isError} = useSubscription();

    const hasActiveSubscription =
        (customerState?.activeSubscriptions?.length ?? 0) > 0;

    return {
        hasActiveSubscription,
        subscription : customerState?.activeSubscriptions?.[0],
        isLoading,
        isError,
    }
}

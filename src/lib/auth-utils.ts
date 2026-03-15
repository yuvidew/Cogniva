// lib/require-auth.ts
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";
import { polarClient } from "./polar";

// Guard that simply ensures a session exists and returns it.
export const requireAuth = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect(`/sign-in`);
    }

    return session;
};

// Check if user has an active premium subscription
export const checkPremiumStatus = async (userId: string): Promise<boolean> => {
    try {
        const customer = await polarClient.customers.getStateExternal({
            externalId: userId,
        });
        return !!(customer.activeSubscriptions?.length && customer.activeSubscriptions[0].status === "active");
    } catch {
        return false;
    }
};

// Guard that ensures user has premium subscription
export const requirePremium = async () => {
    const session = await requireAuth();
    
    const isPremium = await checkPremiumStatus(session.user.id);
    
    if (!isPremium) {
        redirect("/subscribe");
    }

    return session;
};

export const requireUnAuth = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (session) {
        redirect("/subscribe");
    }
};

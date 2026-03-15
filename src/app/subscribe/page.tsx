"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { CheckIcon, RocketIcon, ZapIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";

const features = [
    "Unlimited AI Agents",
    "Image & Video Processing",
    "Web Search Integration",
    "File Uploads & Knowledge Base",
    "Priority Support",
    "Advanced Analytics",
];

export default function SubscribePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const { data: session } = authClient.useSession();

    useEffect(() => {
        // If not logged in, redirect to sign-in
        if (session === null) {
            router.push("/sign-in");
            return;
        }

        if (session) {
            // Check if user already has subscription
            checkSubscription();
        }
    }, [session, router]);

    const checkSubscription = async () => {
        try {
            const res = await authClient.customer.state();
            if (res.data?.activeSubscriptions?.length && res.data.activeSubscriptions[0].status === "active") {
                // User already has premium, redirect to dashboard
                router.push("/dashboard");
                return;
            }
        } catch {
            // No subscription found, show the subscribe page
        }
        setIsLoading(false);
    };

    const handleCheckout = async () => {
        setIsCheckingOut(true);
        try {
            await authClient.checkout({ slug: "cognvia-pro" });
        } catch (error) {
            console.error("Checkout error:", error);
            setIsCheckingOut(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Spinner className="size-8" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background to-muted/30 p-4">
            <div className="max-w-lg w-full">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-primary/10 mb-4">
                        <RocketIcon className="size-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">
                        Unlock <span className="text-primary">Cogniva Pro</span>
                    </h1>
                    <p className="text-muted-foreground">
                        Get access to all premium features and supercharge your AI agents
                    </p>
                </div>

                <div className="bg-card border rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-semibold">Pro Plan</h2>
                            <p className="text-muted-foreground text-sm">Monthly subscription</p>
                        </div>
                        <div className="text-right">
                            <span className="text-3xl font-bold">$29.99</span>
                            <span className="text-muted-foreground">/mo</span>
                        </div>
                    </div>

                    <div className="space-y-3 mb-6">
                        {features.map((feature) => (
                            <div key={feature} className="flex items-center gap-3">
                                <div className="size-5 rounded-full bg-primary/10 flex items-center justify-center">
                                    <CheckIcon className="size-3 text-primary" />
                                </div>
                                <span className="text-sm">{feature}</span>
                            </div>
                        ))}
                    </div>

                    <Button
                        className="w-full h-12 text-base gap-2"
                        onClick={handleCheckout}
                        disabled={isCheckingOut}
                    >
                        {isCheckingOut ? (
                            <Spinner />
                        ) : (
                            <>
                                <ZapIcon className="size-4" />
                                Subscribe Now
                            </>
                        )}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center mt-4">
                        Secure payment powered by Polar. Cancel anytime.
                    </p>
                </div>

                <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground">
                        Questions?{" "}
                        <a href="mailto:support@cogniva.ai" className="text-primary hover:underline">
                            Contact support
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}

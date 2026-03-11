"use client";

import React, { useState } from "react";
import {
    UserCircle,
    ZapIcon,
    CreditCard,
    Bell,
    ShieldCheck,
    ChevronRight,
    LogOutIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import { useSubscription } from "@/features/subscription/hooks/use-subscription";
import { useProfile } from "@/features/profile/hook/use-profile";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { LoadingView } from "@/components/entity-components/loading-view";
import { ErrorView } from "@/components/entity-components/error-view";
import { Spinner } from "@/components/ui/spinner";

export const ProfileLoading = () => {
    return <LoadingView message='Loading profile...' />
};

export const ProfileError = () => {
    return <ErrorView message='Error loading profile' />
};

interface MenuItemProps {
    icon: React.ReactNode;
    iconBg: string;
    title: string;
    description: string;
    onClick?: () => void;
}

const MenuItem = ({ icon, iconBg, title, description, onClick }: MenuItemProps) => (
    <button
        onClick={onClick}
        className="flex w-full items-center gap-4 px-4 py-3.5 hover:bg-muted/50 transition-colors text-left"
    >
        <span className={cn("flex items-center justify-center w-9 h-9 rounded-lg shrink-0", iconBg)}>
            {icon}
        </span>
        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-none mb-1">{title}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
    </button>
);

export const ProfileView = () => {
    const router = useRouter();
    const [isSigningOut, setIsSigningOut] = useState(false);

    const { data: session } = authClient.useSession();
    const { data: subscription } = useSubscription();
    const { data: profile } = useProfile();

    const user = session?.user;
    const isPro = subscription?.activeSubscriptions?.some(
        (s: { status: string }) => s.status === "active"
    );
    const planLabel = isPro ? "Pro Plan" : "Free Plan";
    const messageLimit = isPro
        ? (profile?.messageLimitPro ?? 1000)
        : (profile?.messageLimitFree ?? 100);
    const totalMessages = profile?.totalMessages ?? 0;

    const initials = user?.name
        ? user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
        : "?";

    const onSignOut = async () => {
        setIsSigningOut(true);
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push("/sign-in");
                },
                onError: () => {
                    setIsSigningOut(false);
                },
            },
        });
    };

    return (
        <main className="flex flex-col gap-4 max-w-2xl mx-auto w-full">
            <h1 className="text-2xl font-bold">Profile</h1>

            {/* Profile Header Card */}
            <div className="rounded-xl border bg-card p-5 flex items-center gap-4">
                <Avatar className="w-16 h-16 text-lg">
                    {(profile?.image ?? user?.image) && (
                        <AvatarImage src={(profile?.image ?? user?.image)!} alt={user?.name ?? ""} />
                    )}
                    <AvatarFallback className="bg-violet-500 text-white font-semibold text-lg">
                        {initials}
                    </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1.5">
                    <p className="text-xl font-bold leading-none">{user?.name ?? "—"}</p>
                    <p className="text-sm text-muted-foreground">{user?.email ?? "—"}</p>
                    <Badge
                        variant="outline"
                        className="w-fit gap-1.5 text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-950/40 dark:border-blue-800"
                    >
                        <ZapIcon className="w-3 h-3 fill-blue-600" />
                        {planLabel} · {totalMessages} / {messageLimit} messages
                    </Badge>
                </div>
            </div>

            {/* Account Section */}
            <div className="rounded-xl border bg-card overflow-hidden">
                <p className="text-xs font-semibold text-muted-foreground tracking-widest px-4 pt-4 pb-1">
                    ACCOUNT
                </p>
                <MenuItem
                    icon={<UserCircle className="w-4 h-4 text-blue-600" />}
                    iconBg="bg-blue-50 dark:bg-blue-950/40"
                    title="Edit Profile"
                    description="Name, email, photo"
                />
                <Separator />
                <MenuItem
                    icon={<ZapIcon className="w-4 h-4 text-yellow-500" />}
                    iconBg="bg-yellow-50 dark:bg-yellow-950/40"
                    title="Upgrade to Pro"
                    description="Unlock 1,000 messages/month"
                    onClick={() => authClient.checkout({ slug: "cognvia-pro" })}
                />
                <Separator />
                <MenuItem
                    icon={<CreditCard className="w-4 h-4 text-green-600" />}
                    iconBg="bg-green-50 dark:bg-green-950/40"
                    title="Billing"
                    description={isPro ? "Pro plan · Active" : "Free plan · No card on file"}
                />
            </div>

            {/* Preferences Section */}
            <div className="rounded-xl border bg-card overflow-hidden">
                <p className="text-xs font-semibold text-muted-foreground tracking-widest px-4 pt-4 pb-1">
                    PREFERENCES
                </p>
                <MenuItem
                    icon={<Bell className="w-4 h-4 text-muted-foreground" />}
                    iconBg="bg-muted"
                    title="Notifications"
                    description="Email and push alerts"
                />
                <Separator />
                <MenuItem
                    icon={<ShieldCheck className="w-4 h-4 text-muted-foreground" />}
                    iconBg="bg-muted"
                    title="Security"
                    description="Password, 2FA"
                />
            </div>

            {/* Sign Out */}
            <Button
                variant="outline"
                className="w-full text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/5"
                onClick={onSignOut}
                disabled={isSigningOut}
            >
                {isSigningOut ? <>
                    <Spinner />
                    Signing out…
                </> : <>
                    <LogOutIcon className="w-4 h-4 mr-2" />
                    Sign Out
                </>}
            </Button>
        </main>
    );
};

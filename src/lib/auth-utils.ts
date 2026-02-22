// lib/require-auth.ts
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";
import prisma from "./db";

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



export const requireUnAuth = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (session) {
        redirect("/");
    }
};

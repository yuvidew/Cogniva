/**
 * Auth helpers — persist the session token and user object in
 * chrome.storage.local so the extension stays signed in across
 * browser restarts.
 */
import type { ExtUser } from "./types";

const TOKEN_KEY = "cogniva_token";
const USER_KEY  = "cogniva_user";

export async function saveAuth(token: string, user: ExtUser): Promise<void> {
    await chrome.storage.local.set({ [TOKEN_KEY]: token, [USER_KEY]: user });
}

export async function getToken(): Promise<string | null> {
    const r = await chrome.storage.local.get(TOKEN_KEY);
    return (r[TOKEN_KEY] as string) ?? null;
}

export async function getStoredUser(): Promise<ExtUser | null> {
    const r = await chrome.storage.local.get(USER_KEY);
    return (r[USER_KEY] as ExtUser) ?? null;
}

export async function clearAuth(): Promise<void> {
    await chrome.storage.local.remove([TOKEN_KEY, USER_KEY]);
}

export async function isAuthenticated(): Promise<boolean> {
    const token = await getToken();
    return token != null && token.length > 0;
}

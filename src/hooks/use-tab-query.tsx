"use client";

import { useRouter, useSearchParams } from "next/navigation";


/**
 * Custom hook to sync a tab value with URL search params.
 *
 * @param key - The search param key to use in the URL. Defaults to `"tab"`.
 * @param defaultTab - The fallback tab value when the param is absent. Defaults to `"overview"`.
 * @returns An object with the current `tab` value and a `setTab` function to update it.
 *
 * @example
 * ```tsx
 * const { tab, setTab } = useTabQuery("tab", "overview");
 *
 * // Read the active tab
 * console.log(tab); // "overview" (or whatever is in ?tab=...)
 *
 * // Switch tab — updates the URL to ?tab=chats
 * setTab("chats");
 * ```
 */
export function useTabQuery(key: string = "tab", defaultTab: string = "overview") {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentTab = searchParams.get(key) || defaultTab;

    const setTab = (tab: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set(key, tab);

        router.push(`?${params.toString()}`);
    };

    return {
        tab: currentTab,
        setTab,
    };
}
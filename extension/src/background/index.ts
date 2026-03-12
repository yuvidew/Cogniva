/**
 * Background service worker (Manifest V3).
 *
 * - Enables the Side Panel on every tab.
 * - Forwards page context updates from the content script to session storage
 *   so the side panel React app can read them.
 */

// Open the side panel when the user clicks the extension action icon
chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch(console.error);

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === "PAGE_CONTEXT") {
        chrome.storage.session
            .set({ pageContext: message.payload })
            .then(() => sendResponse({ ok: true }))
            .catch((e: unknown) => sendResponse({ ok: false, error: String(e) }));
        return true; // keep channel open for async sendResponse
    }
});

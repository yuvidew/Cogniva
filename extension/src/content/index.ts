/**
 * Content script — injected into every page.
 *
 * Collects the current page URL, title, selected text, and visible body text
 * then sends them to the background service worker so the side panel can
 * attach them as context when chatting with an agent.
 */

function buildPageContext() {
    const selectedText = window.getSelection()?.toString().trim() ?? "";
    // Grab visible text — cap at 8 000 chars to avoid huge IPC payloads
    const fullText = (document.body?.innerText ?? "").slice(0, 8_000);
    return {
        url: window.location.href,
        title: document.title,
        selectedText: selectedText || undefined,
        fullText: fullText || undefined,
    };
}

function broadcast() {
    chrome.runtime.sendMessage({
        type: "PAGE_CONTEXT",
        payload: buildPageContext(),
    });
}

// Side panel requests context on demand
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === "GET_PAGE_CONTEXT") {
        sendResponse(buildPageContext());
    }
});

// Update context whenever the user selects text
document.addEventListener("mouseup", () => {
    if (window.getSelection()?.toString().trim()) broadcast();
});

// Initial broadcast on page load
broadcast();


export function sendMessageToContentJs(message) {
    (async () => {
        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true,
        });
        if (tab) {
            chrome.tabs.sendMessage(tab.id, message);
        }
    })();
}

export default {
    sendMessageToContentJs
}
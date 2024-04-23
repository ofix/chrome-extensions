export default class Capturer {
    constructor(captureLeft, captureTop, captureRight, captureBottom, pageVisibleHeight) {
        this.capture_x = captureLeft;
        this.capture_y = captureTop;
        this.capture_right = captureRight;
        this.capture_bottom = captureBottom;
        this.page_visible_height = pageVisibleHeight;
        this.canvas = document.createElement("canvas");
        this.canvas.width = this.capture_right - this.capture_x;
        this.canvas.height = this.capture_bottom - this.capture_y;
    }
    chunks() {
        let chunks = [];
        let offsetY = this.capture_y;
        let capture_count = 1;
        let that = this;
        while (offsetY <= this.capture_bottom) {
            window.scrollBy(0, offsetY);
            setTimeout(() => {
                chrome.tabs.captureVisibleTab((screenshotDataUrl) => {
                    chunks.push(screenshotDataUrl);
                    capture_count += 1;
                    offsetY += that.page_visible_height;
                });
            }, 800 * capture_count);
        }
        return chunks;
    }
    sendMessageToContentJs(message) {
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
    scrollPage(x, y, delay_ms) {
        let self = this;
        this.sendMessageToContentJs({
            action: "scroll_page",
            x: x,
            y: y,
        }, self.captureChunk(delay_ms));
    }
    captureChunk(delay_ms) {
        setTimeout(() => {
            chrome.tabs.captureVisibleTab((screenshotDataUrl) => {
                chunks.push(screenshotDataUrl);
            });
        }, 1000);
    }
};
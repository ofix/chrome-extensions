export default class SnapShot {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.draw_height = 0;
    }
    listenCaptureEvent() {
        let self = this;
        chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
            console.log("++++++  message   ++++++");
            console.log(JSON.stringify(message, '', 3));
            if (message.action == "do_capture") {
                if (self.canvas == null) {
                    self.canvas = document.createElement('canvas');
                    self.canvas.width = message.capture_width;
                    self.canvas.height = message.capture_height;
                    self.ctx = self.canvas.getContext('2d');
                }
                chrome.tabs.captureVisibleTab((screenshotDataUrl) => {
                    console.log(">>>>>   capture visible tab    <<<<<");
                    self.drawCapture(self.ctx,
                        screenshotDataUrl,
                        message.sx,
                        message.sy,
                        message.sWidth,
                        message.sHeight,
                        message.dx,
                        message.dy,
                        message.dWidth,
                        message.dHeight);
                    self.draw_height += (message.chunk_bottom - message.chunk_top);
                });
            } else if (message.action == "download_capture") {
                console.log("download capture in popup window");
                self.downloadCapture(message.file_name);
            }
        });
    }
    drawCapture(ctx, imageDataUrl, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) {
        console.log(sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
        let img = new Image();
        img.onload = () => {
            ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
        };
        img.src = imageDataUrl;
    }
    downloadCapture(png_file_name) {
        let png_base64 = this.canvas.toDataURL("image/png");
        let a = document.createElement('a');
        a.href = png_base64;
        a.download = png_file_name;
        a.click();
    }
};
import Redfish from "./redfish";
import NetRules from "./net_rule";

export default class ProxyServer {
    constructor(proxy_server) {
        this.proxy_server = proxy_server || "https://localhost:9999";
        this.visited_urls = {};
        this.visited_pages = [];
        this.net_rules = new NetRules();
        this.net_rules.setProxyServer(this.proxy_server);
    }
    async run() {
        await this.net_rules.update();
        this.listenCommands();
        this.listenWebRequest();
    }
    addProxyFilter(rule) {
        this.net_rules.addProxyFilter(rule);
    }
    // 从background.js发送消息给content.js
    sendMessageToContentJs(message) {
        (async () => {
            const [tab] = await chrome.tabs.query({
                active: true,
                lastFocusedWindow: true,
            });
            if (tab) {
                chrome.tabs.sendMessage(tab.id, message);
            }
        })();
    }
    listenWebRequest() {
        let that = this;
        chrome.webRequest.onCompleted.addListener(
            (request) => {
                let parts = Redfish.searchParams(request.url);
                let origin_url = parts["redirect_url"];
                if (!that.visited_urls.hasOwnProperty(origin_url)) {
                    let url = that.proxy_server + "/request?method=" + request.method + "&url=" + origin_url;
                    that.doGet(url, request.method, origin_url);
                    that.visited_urls[origin_url] = 1;
                }
            },
            {
                urls: [that.proxy_server + "/proxy*"],
            }
        );
    }
    listenCommands() {
        let that = this;
        chrome.commands.onCommand.addListener((shortcut) => {
            if (shortcut == "reload_extension") {
                console.log("reload extension");
                chrome.runtime.reload();
            } else if (shortcut == "download_redfish_pages") {
                that.sendMessageToContentJs({ type: "pages", pages: that.visited_pages });
            }
        });
    }
    doGet(url, method, origin_url) {
        let that = this;
        fetch(url, {
            headers: {
                "Content-Type": "application/json",
            },
        }).then((response) => {
            if (response.ok) {
                return response.json();
            }
            throw new Error("Network response was not ok.");
        }).then((data) => {
            let parameters = data["_dragon_meta_"];
            delete data["_dragon_meta_"];
            that.visited_pages.push({
                url: origin_url,
                method: method,
                parameters: parameters,
                response: data,
            });
            console.log(origin_url);
            console.log(data);
        }).catch((error) => {
            console.info("Error:", error);
        });
    }
}
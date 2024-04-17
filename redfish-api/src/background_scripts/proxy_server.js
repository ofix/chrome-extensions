import Redfish from "./redfish";
import NetRules from "./net_rule";

export default class ProxyServer {
    constructor(proxy_server) {
        this.proxy_server = proxy_server || "https://localhost:9999";
        this.visited_hash = {};
        this.visited_apis = [];
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
        // chrome.runtime.sendMessage(message);
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
    getResponseHeaderValue(response_headers, key) {
        for (let i = 0; i < response_headers.length; i++) {
            if (response_headers[i].hasOwnProperty(key)) {
                return response_headers[i][key];
            }
        }
        return "";
    }
    listenWebRequest() {
        let that = this;
        chrome.webRequest.onCompleted.addListener(
            (request) => {
                let dragon_extra = that.getResponseHeaderValue(request.responseHeaders, "X-Dragon-Extra");
                let parts = Redfish.searchParams(request.url);
                let origin_url = parts["redirect_url"];
                let url = that.proxy_server + "/request?method=" + request.method + "&url=" + origin_url;
                let unique_api = request.method + "_" + origin_url + "_" + dragon_extra;
                if (!that.visited_hash.hasOwnProperty(unique_api)) {
                    that.doGet(url, request.method, origin_url, dragon_extra);
                    that.visited_hash[unique_api] = 1;
                    that.sendMessageToContentJs({ type: "api_count", count: that.visited_apis.length + 1 });
                }
            },
            {
                urls: [that.proxy_server + "/proxy*"]
            },
            ["responseHeaders"]
        );
    }
    listenCommands() {
        let that = this;
        chrome.commands.onCommand.addListener((shortcut) => {
            if (shortcut == "reload_extension") {
                console.log("reload extension");
                chrome.runtime.reload();
            } else if (shortcut == "download_apis") {
                that.sendMessageToContentJs({ type: "download_apis", apis: that.visited_apis });
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
            let parameters = data["@dragon_extra"];
            delete data["@dragon_extra"];
            let api_request = {
                url: origin_url,
                method: method,
                parameters: parameters,
                response: data,
            };
            that.visited_apis.push(api_request);
            console.log(api_request);
        }).catch((error) => {
            console.info("Error:", error);
        });
    }
}
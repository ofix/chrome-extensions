import Redfish from "./redfish";
import NetRules from "./net_rule";

export default class ProxyServer {
    constructor(proxy_server) {
        this.proxy_server = proxy_server || "https://localhost:9999";
        this.visited_hash = {};
        this.visited_apis = [];
        let that = this;
        chrome.storage.local.get("visited_hash", function (result) {
            if (typeof result.visited_hash !== 'undefined') {
                that.visited_hash = result.visited_hash;
            }
        });
        chrome.storage.local.get("visited_apis", function (result) {
            if (typeof result.visited_apis !== 'undefined') {
                that.visited_apis = result.visited_apis;
            }
        });
        this.net_rules = new NetRules();
        this.net_rules.setProxyServer(this.proxy_server);
    }
    async run() {
        await this.net_rules.update();
        this.listenPopup();
        this.listenCommands();
        this.listenWebRequest();
        this.queryHistory();
    }
    queryHistory() {
        let that = this;
        fetch(this.proxy_server + "/history", {
            headers: {
                "Content-Type": "application/json",
            },
        }).then((response) => {
            if (response.ok) {
                return response.json();
            }
            throw new Error("Network response was not ok.");
        }).then((data) => {
            that.visited_apis = data;
            chrome.storage.local.set({ "visited_apis": that.visited_apis });
            chrome.storage.local.set({ "visited_hash": that.visited_hash });
        }).catch((error) => {
            console.info("Error:", error);
        });
    }
    enableMock() {
        this.net_rules.enableMock();
    }
    disableMock() {
        this.net_rules.disableMock();
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
    broadcastMessage(message) {
        chrome.runtime.sendMessage(message);
    }
    getResponseHeaderValue(response_headers, key) {
        for (let i = 0; i < response_headers.length; i++) {
            if (response_headers[i].hasOwnProperty(key)) {
                return response_headers[i][key];
            }
        }
        return "";
    }
    listenPopup() {
        chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
            if (message.type == "query_recent_apis") {
                chrome.runtime.sendMessage({ type: "recent_apis" });
            }
        });
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
                // if (!that.visited_hash.hasOwnProperty(unique_api)) {
                that.doGet(url, request.method, origin_url);
                that.visited_hash[unique_api] = 1;
                // }
                that.sendMessageToContentJs({ type: "api_count", count: that.visited_apis.length + 1 });
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
                chrome.runtime.reload();
            } else if (shortcut == "download_apis") {
                that.sendMessageToContentJs({ type: "download_apis", apis: that.visited_apis });
            } else if (shortcut == "form_record") {
                that.sendMessageToContentJs({ type: "form_record" });
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
            that.visited_apis.push(data);
            chrome.storage.local.set({ "visited_apis": that.visited_apis });
            chrome.storage.local.set({ "visited_hash": that.visited_hash });
            console.log(data);
        }).catch((error) => {
            console.info("Error:", error);
        });
    }
}
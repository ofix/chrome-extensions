export default class NetRules {
    constructor() {
        this.proxy_server = "";
        this.proxy_filters = [];
        this.request_headers = [];
        this.enable_mock = false;
        this.priority = 0;
    }
    enableMock() {
        this.enable_mock = true;
        this.addRequestHeaders({ operation: "set", header: 'X-Dragon-Mock', value: 'True' });
    }
    disableMock() {
        this.enable_mock = false;
        for (let i = 0; i < this.request_headers.length; i++) {
            if (this.request_headers[i].header == 'X-Dragon-Mock') {
                this.request_headers.splice(i);
                break;
            }
        }
    }
    setProxyServer(server) {
        this.proxy_server = server;
    }
    getProxyServer() {
        return this.proxy_server;
    }
    addProxyFilter(condition) {
        this.proxy_filters.push(condition);
    }
    buildProxyRule() {
        let rules = [];
        for (let i = 0; i < this.proxy_filters.length; i++) {
            this.priority += 1;
            let rule = {
                id: this.priority,
                priority: this.priority,
                action: {
                    type: "redirect",
                    redirect: {
                        regexSubstitution: this.proxy_server + "/proxy?redirect_url=\\0"
                    }
                },
                condition: {
                    regexFilter: this.proxy_filters[i],
                    resourceTypes: [
                        "xmlhttprequest"
                    ]
                }
            };
            rules.push(rule);
        }
        return rules;
    }
    isObject(str) {
        try {
            const o = JSON.parse(str);
            if (typeof o === 'object' && o !== null) {
                return true;
            }
            return false;
        } catch (error) {
            return false;
        }
    }
    // 增加额外的HTTP请求头
    addRequestHeaders(headers) {
        if (headers.constructor === Array) {
            this.request_headers = [this.request_headers, ...headers];
        } else if (typeof headers === 'string') {
            if (this.isObject(headers)) {
                const o = JSON.parse(headers);
                this.request_headers.push(o);
            }
        } else if (typeof headers === 'object') {
            this.request_headers.push(headers);
        }
    }
    buildRequestHeaders() {
        if (this.request_headers.length == 0) {
            return [];
        }
        this.priority += 1;
        let rule = {
            id: this.priority,
            priority: this.priority,
            action: {
                type: "modifyHeaders",
                requestHeaders: this.request_headers
            },
            condition: {
                "resourceTypes": [
                    "main_frame", "sub_frame", "xmlhttprequest"
                ]
            }
        }
        return [rule];
    }
    buildModifyHeadRule() {
        this.priority += 1;
        let rule = {
            id: this.priority,
            priority: this.priority,
            action: {
                type: "modifyHeaders",
                responseHeaders: [{
                    header: "Content-Security-Policy",
                    operation: "remove"
                }]
            },
            condition: {
                "resourceTypes": [
                    "main_frame"
                ]
            }
        };
        return rule;
    }
    async update() {
        let rules = [
            ...this.buildProxyRule(),
            ...this.buildRequestHeaders(),
            this.buildModifyHeadRule()
        ];
        // console.log(JSON.stringify(rules, '', 3));
        const oldRules = await chrome.declarativeNetRequest.getDynamicRules();
        const oldRuleIds = oldRules.map(rule => rule.id);

        chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: oldRuleIds,
            addRules: rules
        });
    }
}
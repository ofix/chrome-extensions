export default class NetRules {
    constructor() {
        this.proxy_server = "";
        this.proxy_filters = [];
        this.priority = 0;
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
            this.buildModifyHeadRule()
        ];

        const oldRules = await chrome.declarativeNetRequest.getDynamicRules();
        const oldRuleIds = oldRules.map(rule => rule.id);

        chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: oldRuleIds,
            addRules: rules
        });
    }
}
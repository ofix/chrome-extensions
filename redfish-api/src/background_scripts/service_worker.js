import ProxyServer from "./proxy_server";

let proxy_server = new ProxyServer();
proxy_server.addProxyFilter("^https://[^/]+?/redfish/v1/.*");
proxy_server.run();
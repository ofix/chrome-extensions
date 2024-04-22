import FormSearcher from "./form_searcher"


function downloadRedifshApis(data) {
    var anchor = document.createElement("a");
    anchor.href = window.URL.createObjectURL(new Blob([data]));
    anchor.target = "_blank";
    anchor.download = "redfish.md";
    document.body.appendChild(anchor);
    anchor.click();
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.type == "download_apis") {
        let data = "";
        for (let i = 0; i < message.apis.length; i++) {
            let api = message.apis[i];
            let url = api.url;
            let response = JSON.stringify(api.response, "", 3);
            data += "\n# request\n\n";
            data += "GET," + url + "\n\n";
            data += "# response\n\n";
            data += "```json\n\n";
            data += response + "\n";
            data += "```";
        }
        downloadRedifshApis(data);
    } else if (message.type == "api_count") {
        chrome.action.setBadgeText({ text: (message.count).toString() });
        chrome.action.setBadgeBackgroundColor({ color: "#6600cc" });
    } else if (message.type == "form_record") {
        let searcher = new FormSearcher(location.href);
        searcher.execute();
        console.log(JSON.stringify(searcher.getSearchResult(), '', 3));
    }
});

// chrome.contextMenus.onClicked.addListener(function () {});

// chrome.webRequest.onBeforeRequest.addListener(
//   callback,
//   filter,
//   opt_extraInf
// );




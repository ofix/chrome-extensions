chrome.commands.onCommand.addListener((shortcut) => {
  if (shortcut == "reload_extension") {
    console.log("reload extension");
    chrome.runtime.reload();
  }
});

let visited_urls = {};
let visited_pages = [];
// 发送Get请求
function doGet(url) {
  fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error("Network response was not ok.");
    })
    .then((data) => {
      visited_pages.push({ url: url, response: data });
    })
    .catch((error) => {
      console.info("Error:", error);
    });
}

// 从background.js发送消息给content.js
function sendMessasgeToChromeTab(message) {
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

// chrome.webRequest.onBeforeRequest.addListener(
//   (details) => {
//     console.log("++++++ onBeforeRequest ++++++");
//     console.log(details);
//     return { cancel: false };
//   },
//   {
//     urls: ["https://*/redfish/v1/*"],
//   },
//   ["xmlhttprequest"]
// );

// chrome.webRequest.onBeforeSendHeaders.addListener(
//   (details) => {
//     console.log("++++++ onBeforeSendHeaders ++++++");
//     console.log(details);
//     return { cancel: false };
//   },
//   {
//     urls: ["https://*/redfish/v1/*"],
//   },
//   ["xmlhttprequest"]
// );

chrome.webRequest.onCompleted.addListener(
  (request) => {
    const url = request.url;
    const method = request.method;
    console.log("+++++ onCompleted +++++");
    console.log(request);
    if (method == "GET" && !visited_urls.hasOwnProperty(url)) {
      doGet(url);
      visited_urls[url] = 1;
    }
  },
  {
    urls: ["https://*/redfish/v1/*"],
  }
);

chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((e) => {
  console.error("+++++ onRuleMatchedDebug +++++");
  console.error(e);
});

// 完成请求，发送数据给客户端
// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//   if (request.stop_listen) {
//     sendResponse(visited_pages);
//   }
// });

// 监听快捷键
chrome.commands.onCommand.addListener((command) => {
  sendMessasgeToChromeTab({ type: "pages", pages: visited_pages });
});

chrome.commands.onCommand.addListener((shortcut) => {
  if (shortcut == "reload_extension") {
    console.log("reload extension");
    chrome.runtime.reload();
  }
});

function parseUrl(url) {
  let i = url.indexOf("?");
  if (i == -1) {
    return {};
  }
  let parts = {};
  let parameters = url.substring(i + 1);
  const PARSE_KEY = 0;
  const PARSE_VAL = 1;
  let k = "",
    v = "";
  let state = PARSE_KEY;
  for (let i = 0; i < parameters.length; i++) {
    if (state == PARSE_KEY && parameters[i] != "=") {
      k += parameters[i];
    }
    if (state == PARSE_VAL) {
      v += parameters[i];
    }
    if (parameters[i] == "=") {
      state = PARSE_VAL;
    } else if (parameters[i] == "&") {
      state = PARSE_KEY;
      parts[k] = v;
      k = "";
      v = "";
    }
  }
  parts[k] = v;
  return parts;
}

let visited_urls = {};
let visited_pages = [];
// 发送Get请求
function doGet(url, method, origin_url) {
  fetch(url, {
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
      let parameters = data["_dragon_meta_"];
      delete data["_dragon_meta_"];
      visited_pages.push({
        url: origin_url,
        method: method,
        parameters: parameters,
        response: data,
      });
      console.log(origin_url);
      console.log(data);
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
    let parts = parseUrl(request.url);
    let origin_url = parts["redirect_url"];
    if (!visited_urls.hasOwnProperty(origin_url)) {
      let url =
        "https://localhost:9999/request?method=" +
        request.method +
        "&url=" +
        origin_url;
      doGet(url, request.method, origin_url);
      visited_urls[origin_url] = 1;
    }
  },
  {
    urls: ["https://localhost:9999/proxy*"],
  }
);

// chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((e) => {
//   console.error("+++++ onRuleMatchedDebug +++++");
//   console.error(e);
// });

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

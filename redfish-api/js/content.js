function downloadRedifshApis(data) {
  var anchor = document.createElement("a");
  anchor.href = window.URL.createObjectURL(new Blob([data]));
  anchor.target = "_blank";
  anchor.download = "redfish.md";
  document.body.appendChild(anchor);
  anchor.click();
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type == "pages") {
    let data = "";
    for (i = 0; i < request.pages.length; i++) {
      let page = request.pages[i];
      let url = page.url;
      let response = JSON.stringify(page.response, "", 3);
      data += "\n# request\n\n";
      data += "GET," + url + "\n\n";
      data += "# response\n\n";
      data += "```json\n\n";
      data += response + "\n";
      data += "```";
    }
    downloadRedifshApis(data);
  }
});

// sendMessage({ stop_listen: true }, function (data) {
//   console.log(data);
// });

// chrome.contextMenus.onClicked.addListener(function () {});

// chrome.devtools.network.onRequestFinished.addListener(function (request) {
//   if (request.response.bodySize > 40 * 1024) {
//     chrome.devtools.inspectedWindow.eval(
//       'console.log("Large image: " + unescape("' +
//         escape(request.request.url) +
//         '"))'
//     );
//   }
// });

// chrome.webRequest.onBeforeRequest.addListener(
//   callback,
//   filter,
//   opt_extraInfoSpec
// );

// 发送一条消息告诉[background.js]返回对应的请求数据
function sendMessage(message, callback) {
  (async () => {
    const response = await chrome.runtime.sendMessage(message);
    if (typeof callback === "function") {
      callback(response);
    }
  })();
}
// 接收[background.js]消息

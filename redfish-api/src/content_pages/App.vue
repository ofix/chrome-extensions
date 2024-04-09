<template>
    <el-button>这是一个测试按钮</el-button>
</template>
   
<script setup>
import { onMounted } from 'vue'

function downloadRedifshApis(data) {
    var anchor = document.createElement("a");
    anchor.href = window.URL.createObjectURL(new Blob([data]));
    anchor.target = "_blank";
    anchor.download = "redfish.md";
    document.body.appendChild(anchor);
    anchor.click();
}

// 发送一条消息告诉[background.js]返回对应的请求数据
function sendMessage(message, callback) {
    (async () => {
        const response = await chrome.runtime.sendMessage(message);
        if (typeof callback === "function") {
            callback(response);
        }
    })();
}

onMounted(() => {
    console.log("content page onMounted....");
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        console.log("receive message from background.js");
        if (request.type == "pages") {
            let data = "";
            for (let i = 0; i < request.pages.length; i++) {
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
</script>
   
<style lang="less" scoped>
.popup-header {
    width: 100px;
    height: 100px;
    color: red;
}
</style>
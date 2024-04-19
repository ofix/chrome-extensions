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
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.type == "download_apis") {
            let data = "";
            for (let i = 0; i < request.apis.length; i++) {
                let api = request.apis[i];
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
        } else if (request.type == "api_count") {
            chrome.action.setBadgeText({ text: (request.count).toString() });
            chrome.action.setBadgeBackgroundColor({ color: "#6600cc" });
        }
    });
});

// chrome.contextMenus.onClicked.addListener(function () {});

// chrome.webRequest.onBeforeRequest.addListener(
//   callback,
//   filter,
//   opt_extraInfoSpec
// );
</script>
   
<style lang="less" scoped></style>
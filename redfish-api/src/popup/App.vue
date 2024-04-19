<template>
    <el-tabs type="border-card" class="popup-tabs">
        <el-tab-pane label="接口">
            <el-table :data="apis" style="width: 100%">
                <el-table-column prop="@dragon.url_path" label="URL" width="300">
                    <template #default="scope">
                        <div class="ellipsis" :title="scope.row['@dragon.url_path']">
                            {{ scope.row["@dragon.url_path"] }}
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="@dragon.method" label="请求方法">
                    <template #default="scope">
                        <div :class="scope.row['@dragon.method_style']">
                            {{ scope.row["@dragon.method"] }}
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="@dragon.status_code" label="状态码" />
                <el-table-column prop="@dragon.request_time" label="请求时间" width="190" />
                <el-table-column prop="@dragon.duration" label="请求耗时" />
            </el-table>
            <el-button id="more-btn" type="primary" text bg @click="on">查看更多</el-button>
        </el-tab-pane>
        <el-tab-pane label="配置">配置</el-tab-pane>
    </el-tabs>
</template>

<script setup>
import { ref } from 'vue';
let apis = ref([]);

const elementIsVisibleInViewport = (el, partiallyVisible = false) => {
    const { top, left, bottom, right } = el.getBoundingClientRect();
    const { innerHeight, innerWidth } = window;
    return partiallyVisible
        ? ((top > 0 && top < innerHeight) ||
            (bottom > 0 && bottom < innerHeight)) &&
        ((left > 0 && left < innerWidth) || (right > 0 && right < innerWidth))
        : top >= 0 && left >= 0 && bottom <= innerHeight && right <= innerWidth;
};

let opened = false;

setInterval(function () {
    let ele = document.getElementById("app");
    if (elementIsVisibleInViewport(ele) && !opened) {
        chrome.runtime.sendMessage({ type: "query_recent_apis" });
        opened = true;
    }
}, 500);

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.type == "recent_apis") {
        chrome.storage.local.get("visited_apis", function (result) {
            if (typeof result.visited_apis !== 'undefined') {
                let records = result.visited_apis.slice(-10);
                for (let i = 0; i < records.length; i++) {
                    records[i]['@dragon.url_path'] = records[i]["@dragon.url"]["path"];
                    records[i]['@dragon.duration'] = records[i]["@dragon.duration"] + "ms";
                    records[i]['@dragon.method_style'] = 'method ' + 'method-' + records[i]['@dragon.method'].toLowerCase();
                }
                apis.value = records;
            }
        });
    }
});
</script>

<style lang="less" scoped>
.ellipsis {
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

#more-btn {
    position: fixed;
    bottom: 24px;
    left: 24px;
}

.method {
    width: 48px;
    height: 24px;
    line-height: 24px;
    text-align: center;
    border-radius: 4px;
}

.method-get {
    background-color: #d6f1c1;
    color: #5B9D30;
}

.method-post {
    background-color: #f9e5fc;
    color: #8f0c9e;
}

.method-patch {
    background-color: #dff4f6;
    color: #39e1de;
}

.method-put {
    background-color: #f8f8e7;
    color: #87570a;
}

.method-delete {
    background-color: #f7d9d5;
    color: #eb0e0e;
}

.popup-tabs {
    width: 760px;
    height: 560px;
}

.popup-tabs>.el-tabs__content {
    padding: 32px;
    color: #6b778c;
    font-size: 32px;
    font-weight: 600;
}

.popup-tabs .custom-tabs-label .el-icon {
    vertical-align: middle;
}

.popup-tabs .custom-tabs-label span {
    vertical-align: middle;
    margin-left: 4px;
}

.popup-tabs>.el-tabs__content {
    padding: 32px;
    color: #6b778c;
    font-size: 32px;
    font-weight: 600;
}

.popup-tabs .custom-tabs-label .el-icon {
    vertical-align: middle;
}

.popup-tabs .custom-tabs-label span {
    vertical-align: middle;
    margin-left: 4px;
}
</style>

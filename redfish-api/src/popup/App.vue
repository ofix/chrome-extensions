<template>
    <el-tabs type="border-card" class="popup-tabs">
        <el-tab-pane label="接口">
            <el-table :data="apis" style="width: 100%">
                <el-table-column prop="url" label="URL" />
                <el-table-column prop="method" label="请求方法" width="180" />
                <el-table-column prop="parameters" label="请求参数" />
                <el-table-column prop="duration" label="请求耗时" width="180" />
            </el-table>
        </el-tab-pane>
        <el-tab-pane label="配置">配置</el-tab-pane>
    </el-tabs>
</template>

<script>
// import { ref } from 'vue';
// let apis = ref([]);
console.log("popup new request");
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    console.error("++++++ receive new _request ++++++++");
    if (message.type == "new_request") {
        apis.unshift(message.data);
        if (apis.length > 10) {
            apis.pop();
        }
    }
});
// console.info("enter pop window inited");
// onMounted(() => {
//     console.log("popup on mounted");

// });

</script>

<style lang="less" scoped>
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

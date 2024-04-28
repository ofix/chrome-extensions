<template>
    <el-row :gutter="20">
        <el-col :span="6">
            <el-scrollbar height="100vh">
                <el-tree style="max-width: 320px" :data="apis" draggable default-expand-all :allow-drop="allowDrop"
                    :allow-drag="allowDrag" :props="defaultProps">
                    <template #default="{ node, data }">
                        <span class="dragon-tree-node" @click="onSelectApi($event, node, data)"
                            @dblclick="onDoubleClickApiItem($event, node, data)">
                            <span v-if="data.type === 'api'">
                                <span :class="data.api['@dragon.method_style']">
                                    {{ data.api["@dragon.method"] }}
                                </span>
                                <span style="max-width:70%; margin-left:10px;">
                                    <span v-if="data.in_edit === false">
                                        {{ node.label }}
                                    </span>
                                    <span v-else>
                                        <input class="editable-url-alias" v-model="node.label" />
                                    </span>
                                </span>
                                <a @click="onClickTreeContextMenuBtn(data)"
                                    style="display:inline-block; margin-right:4px; float:right;">...</a>
                            </span>
                            <span v-else-if="data.type === 'dir'">
                                <span>
                                    {{ node.label }}
                                </span>
                            </span>
                        </span>
                    </template>
                </el-tree>
            </el-scrollbar>

        </el-col>
        <el-col :span="18">
            <el-row>
                <el-col :span="4">
                    <el-dropdown>
                        <el-button type="primary">
                            请求方法<el-icon class="el-icon--right"><arrow-down /></el-icon>
                        </el-button>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item>
                                    <span class="method-get">GET</span>
                                </el-dropdown-item>
                                <el-dropdown-item>
                                    <span class="method-post">POST</span>
                                </el-dropdown-item>
                                <el-dropdown-item>
                                    <span class="method-patch">PATCH</span>
                                </el-dropdown-item>
                                <el-dropdown-item>
                                    <span class="method-put">PUT</span>
                                </el-dropdown-item>
                                <el-dropdown-item>
                                    <span class="method-delete">DELETE</span>
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </el-col>
                <el-col :span="20">
                    <el-input v-model="current_api['@dragon.url_path']"></el-input>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="24">
                    <el-scrollbar height="680px">
                        <highlightjs :language="highlight_language" :autodetect="highlight_autodetect"
                            :code="highlight_data" />
                    </el-scrollbar>
                </el-col>
            </el-row>
        </el-col>
    </el-row>


    <!-- <el-tabs type="border-card" class="popup-tabs">
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
        </el-tab-pane>
        <el-tab-pane label="配置">配置</el-tab-pane>
    </el-tabs> -->
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { ArrowDown } from '@element-plus/icons-vue';
import dragon from "../utils/dragon";

let apis = ref([]);
let current_api = ref({});
let highlight_language = ref("json");
let highlight_autodetect = ref(false);
let highlight_data = ref("");

const defaultProps = {
    children: 'children',
    label: 'label',
}

function allowDrop(draggingNode, dropNode, type) {
    return true;
}
function allowDrag(draggingNode) {
    return draggingNode.data.type == 'api';
}

function onSelectApi($event, node, data) {
    current_api.value = data.api;
    highlight_data.value = JSON.stringify(data.api["@dragon.response"], '', 3);
}

function onClickTreeContextMenuBtn(data) {
    console.log(data);
}

// 开始编辑
function onDoubleClickApiItem($event, node, data) {
    data.in_edit = true;
    console.log(data);
}

// 保存url_alias
function onSaveApiUrlAlias(api) {
    let para = {
        url_alias: api["@dragon.url_alias"],
        hostname: api["@dragon.hostname"],
        url_path: api["@dragon.url_path"],
        method: api["@dragon.method"]
    };
    dragon.post("/url_alias", para);
}

onMounted(() => {
    chrome.storage.local.get("visited_apis", function (result) {
        if (typeof result.visited_apis !== 'undefined') {
            let records = result.visited_apis;
            let tree = [{
                label: "2024/04/26",
                type: "dir",
                api: null,
                children: []
            }];
            for (let i = 0; i < records.length; i++) {
                records[i]['@dragon.url_path'] = records[i]["@dragon.url"]["path"];
                records[i]['@dragon.duration'] = records[i]["@dragon.duration"] + "ms";
                records[i]['@dragon.method_style'] = 'method ' + 'method-' + records[i]['@dragon.method'].toLowerCase();
                let item = {
                    label: records[i]['@dragon.url_alias'],
                    type: "api",
                    in_edit: false,
                    api: records[i],
                    children: [
                    ],
                };
                tree[0].children.push(item);
            }
            apis.value = tree;
            current_api.value = tree[0];
        }
    });
});
</script>

<style lang="less" scoped>
.ellipsis {
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

#bottom-toolbar {
    position: fixed;
    bottom: 24px;
    left: 24px;
}

.editable-url-alias {
    outline: none;
    width: 100%;
    height: 26px;
    line-height: 26px;
    border: none;
    border-bottom: 1px solid #2670e6;
    padding: 1px;
}

.el-dropdown+.el-dropdown {
    margin-left: 15px;
}

.el-dropdown-link {
    cursor: pointer;
    color: var(--el-color-primary);
    display: flex;
    align-items: center;
}

.el-tree-node__content {
    height: 36px !important;
    line-height: 36px !important;
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
</style>
import { createApp } from "vue";
import AppApi from "./views/api.vue";

import ElementPlus from "element-plus";
import "element-plus/theme-chalk/index.css";

// 引入highlight.js依赖和语言
import 'highlight.js/styles/stackoverflow-light.css'
import hljs from "highlight.js/lib/core";
import hljsVuePlugin from "@highlightjs/vue-plugin";
// 按需引入高亮的语言
import json from "highlight.js/lib/languages/json";
hljs.registerLanguage("json", json);

const app = createApp(AppApi);

app.use(ElementPlus);
app.use(hljsVuePlugin);
app.mount("#app-api");
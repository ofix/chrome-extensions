import { createApp } from "vue";
import AppDefault from "./views/default.vue";

import ElementPlus from "element-plus";
import "element-plus/theme-chalk/index.css";
const app = createApp(AppDefault);

app.use(ElementPlus);
app.mount("#app-default");

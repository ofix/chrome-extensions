import { createApp } from "vue";
import AppApi from "./views/api.vue";

import ElementPlus from "element-plus";
import "element-plus/theme-chalk/index.css";
const app = createApp(AppApi);

app.use(ElementPlus);
app.mount("#app-api");
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import copy from "rollup-plugin-copy";
import path from "path";
import basicSsl from "@vitejs/plugin-basic-ssl";

export default defineConfig({
    root: "src/", // 不增加此项设置 html文件将无法正常拷贝
    plugins: [
        vue(),
        copy({
            targets: [
                { src: "src/manifest.json", dest: "dist" },
                { src: "src/assets/**", dest: "dist/assets" },
                { src: "src/_locales/**/*", dest: "dist/_locales" },
            ],
            verbose: true,
        }),
        basicSsl({
            name: "dev_server_cert",
            domains: ["127.0.0.1"],
            certDir: "./dist/ssl-cert",
        }),
    ],
    resolve: {
        alias: {
            "@": resolve("./src"),
        },
    },
    server: {
        host: "0.0.0.0",
        open: true, //vite项目启动时自动打开浏览器
        strictPort: 8080, //vite项目启动时自定义端口
        hmr: true, //开启热更新
    },
    build: {
        chunkSizeWarningLimit: 2000,
        outDir: path.resolve(__dirname, "dist"),
        assetsDir: "assets",
        sourcemap: false,
        rollupOptions: {
            input: {
                popup: path.resolve(__dirname, "src/popup/index.html"),
                content_page_default: path.resolve(__dirname, "src/content_pages/default.html"),
                content_page_api: path.resolve(__dirname, "src/content_pages/api.html"),
                content: path.resolve(__dirname, "src/content_scripts/content.js"),
                watcher: path.resolve(__dirname, "src/content_scripts/watcher.js"),
                background: path.resolve(
                    __dirname,
                    "src/background_scripts/service_worker.js"
                ),
            },
            output: {
                entryFileNames: (chunkInfo) => {
                    let baseName = path.basename(
                        chunkInfo.facadeModuleId,
                        path.extname(chunkInfo.facadeModuleId)
                    );
                    let entry_name = "";
                    if (baseName == "watcher") {
                        entry_name = "content/watcher.js";
                    } else if (chunkInfo.facadeModuleId.indexOf("content_pages") != -1) {
                        entry_name = "content_pages/" + baseName + ".js";
                    } else {
                        const saveArr = ["content", "watcher", "service_worker"];
                        entry_name = `[name]/${saveArr.includes(baseName) ? baseName : chunkInfo.name
                            }.js`;
                    }
                    return entry_name;
                },
                assetFileNames: "[name]/[name].[ext]", // 静态资源
            },
        },
    },
});

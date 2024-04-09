import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import copy from "rollup-plugin-copy";
import path from "path";
import basicSsl from '@vitejs/plugin-basic-ssl';

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
      name: 'dev_server_cert',
      domains: ['127.0.0.1'],
      certDir: './dist/ssl-cert'
    })
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
        content_pages: path.resolve(__dirname, "src/content_pages/index.html"),
        content: path.resolve(__dirname, "src/content_scripts/content.js"),
        background: path.resolve(
          __dirname,
          "src/background_scripts/service_worker.js"
        ),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          const baseName = path.basename(
            chunkInfo.facadeModuleId,
            path.extname(chunkInfo.facadeModuleId)
          );
          const saveArr = ["content", "service_worker"];
          const entry_name = `[name]/${saveArr.includes(baseName) ? baseName : chunkInfo.name
            }.js`;
          return entry_name;
        },
        assetFileNames: "[name]/[name].[ext]", // 静态资源
      },
    },
  },
});

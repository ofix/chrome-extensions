## 目录结构文件说明

```js
--- chrome-extension-template
    |
    --- src                    // vue3+vite项目源代码
    |   |
    |   --- _locales           // chrome插件语言国际化
    |   |
    |   --- assets             // 存放chrome插件图标的地方
    |   |
    |   --- background_scripts // chrome插件后台长时间运行的脚本目录
    |   |   |
    |   |   --- server_worker.js
    |   |
    |   --- content_pages    // chrome插件页面运行的脚本目录
    |   |   |
    |   |   --- components
    |   |   |
    |   |   --- store
    |   |   |
    |   |   --- App.vue
    |   |   |
    |   |   --- main.js
    |   |   |
    |   |   --- style.css
    |   |   |
    |   |   --- index.html
    |   |
    |   --- popup         // chrome插件浏览器右上
    |   |   |
    |   |   --- components
    |   |   |
    |   |   --- store
    |   |   |
    |   |   --- App.vue
    |   |   |
    |   |   --- main.js
    |   |   |
    |   |   --- style.css
    |   |   |
    |   |   --- index.html
    |   |
    |   --- manifest.json // chrome插件配置文件
    |
    --- vite.config.js    // vite编译配置文件入口
    |
    --- package.json      // npm项目依赖文件
    |
    --- dist              // vue3+vite项目编译后的文件夹，此文件夹里面的所有文件最终将打包成chrome扩展
```

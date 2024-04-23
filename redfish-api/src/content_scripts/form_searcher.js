
export default class FormSearcher {
    constructor(page_url, selectors) {
        this.page_url = page_url;   // 当前页面URL
        this.selectors = selectors || "input,select"; // 表单元素选择器, 逗号分割的选择器，比如 div,.el-input,#visible-color
        this.left = 10000;          // 表单起始X坐标
        this.top = 10000;           // 表单起始Y坐标
        this.right = 0;             // 表单宽度
        this.bottom = 0;            // 表单高度
        this.search_nodes = [];     // 查找到的表单元素集合
        this.capture_data = null;   // 当前表单对应的屏幕截图
        this.dragon_url = "";       // dragon_url保存的文件名称和路径
        this.canvas = document.createElement("canvas"); // 绘制画布
    }
    execute() {
        let nodes = window.parent.document.querySelectorAll(this.selectors)
        for (let i = 0; i < nodes.length; i++) {
            let o = this.nodeJsPath(nodes[i]);
            this.search_nodes.push(o);
        }
        this.calcCaptureAreaSize(); // 计算画布大小
        this.capture(); // 截屏
        this.downloadCaptureImage("dragon_capture.png");
    }
    // 需要考虑页面窗口是否包含滚动条，是否有横向滚动条
    capture() {
        let chunks = this.captureChunks();
        this.mergeChunks(chunks);
    }
    downloadCaptureImage(png_file_name) {
        let png_base64 = this.canvas.toDataURL("image/png");
        let a = document.createElement('a');
        a.href = png_base64;
        a.download = png_file_name;
        a.click();
    }
    captureChunks() {
        // 发送消息给 service_worker.js, 由 service_worker 进行截屏并绘制
        // 绘制过程中需要滚动
        // 
        let chunks = [];
        let offsetY = this.top;
        let visible_height = this.getPageVisibleHeight();
        let capture_count = 1;
        while (offsetY <= this.bottom) {
            window.scrollBy(0, offsetY);
            setInterval(() => {
                chrome.tabs.captureVisibleTab((screenshotDataUrl) => {
                    let img = new Image();
                    img.src = screenshotDataUrl;
                    chunks.push(img);
                });
            }, 800 * capture_count);
            capture_count += 1;
            offsetY += visible_height;
        }
        return chunks;
    }
    mergeChunks(chunks) {
        var ctx = canvas.getContext("2d");
        let width = this.right - this.left;  // 区域截图宽度
        let height = this.bottom - this.top; // 区域截图高度
        let visible_height = this.getPageVisibleHeight();
        for (let i = 0; i < chunks.length; i++) {
            chunks[i].onload = () => {
                ctx.drawImage(chunks[i], this.left, 0, width, visible_height,
                    0, visible_page_height * i, width, height);
            }
        }
    }
    // 获取页面可视高度
    getPageVisibleHeight() {
        const windowHeight =
            window.innerHeight ||
            document.documentElement.clientHeight ||
            document.body.clientHeight;
        return windowHeight;
    }
    // 获取页面可视宽度
    getPageVisibleWidth() {
        const windowWidth =
            window.innerWidth ||
            document.documentElement.clientWidth ||
            document.body.clientWidth;
        return windowWidth;
    }
    getCaptureSize() {
        return {
            left: this.left,
            top: this.top,
            right: this.right,
            bottom: this.bottom
        };
    }

    calcCaptureAreaSize() {
        for (let i = 0; i < this.search_nodes.length; i++) {
            if (this.left > this.search_nodes[i].left) {
                this.left = this.search_nodes[i].left;
            }
            if (this.right < this.search_nodes[i].right) {
                this.right = this.search_nodes[i].right;
            }
            if (this.top > this.search_nodes[i].top) {
                this.top = this.search_nodes[i].top;
            }
            if (this.bottom < this.search_nodes[i].bottom) {
                this.bottom = this.search_nodes[i].bottom;
            }
        }
    }
    getSearchResult() {
        return {
            page_url: this.page_url,
            search_nodes: this.search_nodes
        };
    }
    classNameToArray(className) {
        return className.split(" ");
    }
    // 查找相同类型的子元素所在位置
    getNodeIndex(parentNode, currentNode) {
        let childIndex = 0;
        let childCount = 0;
        for (let i = 0; i < parentNode.childNodes.length; i++) {
            let child = parentNode.childNodes[i];
            if (child.nodeName == currentNode.nodeName) {
                if (child === currentNode) {
                    childIndex = childCount;
                }
                childCount++;
            }
        }
        return [childIndex + 1, childCount];
    }
    // 查找元素唯一路径 nodeJsPath
    nodeJsPath(node) {
        let stack = [];
        let value = node.value;
        var rect = node.getBoundingClientRect();
        while (node.parentNode != null) {
            let [index, count] = this.getNodeIndex(node.parentNode, node);
            if (node.hasAttribute('id') && node.id != '') {
                stack.unshift(node.nodeName.toLowerCase() + '#' + node.id);
                break;
            } else if (count > 1 && index > 0) {
                stack.unshift(node.nodeName.toLowerCase() + ':nth-child(' + index + ')');
            } else {
                stack.unshift(node.nodeName.toLowerCase());
            }
            node = node.parentNode;
        }
        return {
            js_path: stack.join(" > "),
            left: rect.left,
            top: rect.top,
            right: rect.right,
            bottom: rect.bottom,
            value: value,
        };
    }
}
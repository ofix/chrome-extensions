
export default class FormSearcher {
    constructor(page_url, selectors) {
        this.page_url = page_url;   // 当前页面URL
        this.selectors = selectors || "input,select"; // 表单元素选择器, 逗号分割的选择器，比如 div,.el-input,#visible-color
        this.search_nodes = [];     // 查找到的表单元素集合
        this.node_ancestors = [];   // 所有元素的祖先路径
        this.capture_data = null;   // 当前表单对应的屏幕截图
        this.dragon_url = "";       // dragon_url保存的文件名称和路径
        this.in_capture = false;     // 是否在截屏中
        this.canvas = document.createElement("canvas"); // 绘制画布
        this.origin_x = window.scrollX; // 滚动之前页面的起始X坐标
        this.origin_y = window.scrollY; // 滚动之前页面的起始Y坐标
        this.capture_left = 0;          // 截屏区域左上角X坐标
        this.capture_top = 0;           // 截屏区域左上角Y坐标
        this.capture_right = 0;         // 截屏区域右下角X坐标
        this.capture_bottom = 0;        // 截屏区域右下角Y坐标
        this.chunks = [];               // 需要滚动的Y坐标
        this.scroll_top_gap = 20;       // 顶部距离
        this.scroll_height = 0;         // 每次滚动的高度
        this.common_ancestor = null;    // 共同祖先
    }
    setScrollTopGap(gap) {
        this.scroll_top_gap = gap;
    }
    getCaptureSize() {
        return {
            left: this.left,
            top: this.top,
            right: this.right,
            bottom: this.bottom
        };
    }
    getSearchResult() {
        return {
            page_url: this.page_url,
            search_nodes: this.search_nodes
        };
    }
    /**
     * 1. 先找到页面中的表单
     * 2. 计算表单所在屏幕区域
     * 3. 截屏
     * 4. 滚动到指定区域后发送截屏功能给 service_worker 进程
     */
    async find() {
        this.findFormFields();
        this.findCommonAncestor();
        this.calcCaptureAreaSize();
        this.prepareBeforeCapture();
        await this.capture();
        this.downloadSnapshot("dragon_capture.png");
    }
    isNodeVisible(node) {
        return node.offsetParent !== null;
    }
    findFormFields() {
        let nodes = window.parent.document.querySelectorAll(this.selectors)
        for (let i = 0; i < nodes.length; i++) {
            if (this.isNodeVisible(nodes[i])) {
                let o = this.nodeJsPath(nodes[i]);
                let ancestor_path = this.nodeAncestorPath(nodes[i]);
                this.search_nodes.push(o);
                this.node_ancestors.push(ancestor_path);
            } else {
                console.log("node is invisible " + nodes[i]);
            }
        }
    }
    findCommonAncestor() { // 寻找元素共同的祖先
        if (this.node_ancestors.length == 0) {
            return "";
        }
        if (this.node_ancestors.length == 1) {
            return this.node_ancestors[0];
        }
        let prefix = this.node_ancestors[0];
        let prefix_length = prefix.length;
        for (let i = 1; i < this.node_ancestors.length; i++) {
            for (let j = 0; j <= prefix_length; j++) {
                if (prefix[j] != this.node_ancestors[i][j]) {
                    prefix_length = j;
                }
            }
        }
        prefix = prefix.slice(0, prefix_length);
        // 寻找最近的ID
        let target_id = "";
        for (let i = prefix.length - 1; i > 0; i--) {
            if (prefix[i].indexOf('#') != -1) {
                target_id = prefix[i];
                break;
            }
        }
        if (target_id == "") {
            target_id = prefix.join(">");
        }
        this.common_ancestor = document.querySelector(target_id);
        console.log(this.common_ancestor);
    }
    calcCaptureAreaSize() {
        if (this.common_ancestor != null) {
            let rect = this.common_ancestor.getBoundingClientRect();
            this.capture_left = rect.left;
            this.capture_top = rect.top;
            this.capture_right = rect.right;
            this.capture_bottom = rect.bottom;
        } else {
            let left = 100000;
            let top = 100000;
            let right = 0;
            let bottom = 0;
            for (let i = 0; i < this.search_nodes.length; i++) {
                if (left > this.search_nodes[i].left) {
                    left = this.search_nodes[i].left;
                }
                if (right < this.search_nodes[i].right) {
                    right = this.search_nodes[i].right;
                }
                if (top > this.search_nodes[i].top) {
                    top = this.search_nodes[i].top;
                }
                if (bottom < this.search_nodes[i].bottom) {
                    bottom = this.search_nodes[i].bottom;
                }
            }
            this.capture_left = left;
            this.capture_top = top;
            this.capture_right = right;
            this.capture_bottom = bottom;
        }
    }
    prepareBeforeCapture() {
        this.visible_width = this.getPageVisibleWidth();
        this.visible_height = this.getPageVisibleHeight();
        if (this.capture_y < this.origin_y) { // 
            this.origin_y = this.capture_y - this.scroll_top_gap; // 初次移动的位置
        }
        this.scroll_height = this.visible_height - this.scroll_top_gap;
        let y = this.origin_y;
        while (y <= this.capture_bottom) {
            let o = {
                left: 0,
                top: y,
                right: this.capture_right,
                bottom: (y + this.scroll_height) >= this.capture_bottom ? this.capture_bottom : y + this.scroll_height
            }
            this.chunks.push(o);
            y += this.scroll_height;
        }
    }
    async capture() {
        for (let i = 0; i < this.chunks.length; i++) {
            window.scrollTo(this.chunks[i].left, this.chunks[i].top);
            console.log("scroll to ", this.chunks[i].left, this.chunks[i].top);
            await this.doCapture(1800, this.chunks[i]);
        }
    }
    async doCapture(timeout, chunk) {
        let that = this;
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log("+++++ chunk  +++++");
                console.log(chunk);
                chrome.runtime.sendMessage({
                    action: "do_capture",
                    capture_width: that.capture_right - that.capture_left,
                    capture_height: that.capture_bottom - that.capture_top,
                    sx: that.capture_left,
                    sy: that.capture_top,
                    sWidth: that.capture_right - that.capture_left,
                    sHeight: that.capture_bottom - that.capture_top,
                    dx: 0,
                    dy: 0,
                    dWidth: that.capture_right - that.capture_left,
                    dHeight: that.capture_bottom - that.capture_top
                });
                resolve();
            }, timeout);
        });
    }
    downloadSnapshot(png_file_name) {
        setTimeout(() => {
            console.log("download png");
            chrome.runtime.sendMessage({
                action: "download_capture",
                file_name: png_file_name
            });
        }, 2000);
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
    classNameToArray(classList) {
        let classes = [];
        classList.forEach(className => {
            classes.push(className);
        });
        return classes;
    }
    firstClassName(classList) {
        let classes = this.classNameToArray(classList);
        if (classes.length > 0) {
            return classes[0];
        }
        return "";
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
    nodeAncestorPath(node) {
        let stack = [];
        while (node.parentNode != null) {
            let [index, count] = this.getNodeIndex(node.parentNode, node);
            let class_name = this.firstClassName(node.classList);
            if (node.hasAttribute('id') && node.id != '') {
                stack.unshift(node.nodeName.toLowerCase() + '#' + node.id);
            } else if (count > 1 && index > 0) {
                stack.unshift(node.nodeName.toLowerCase() + ':nth-child(' + index + ')');
            } else {
                if (class_name != "") {
                    stack.unshift(node.nodeName.toLowerCase() + "." + class_name);
                } else {
                    stack.unshift(node.nodeName.toLowerCase());
                }
            }
            node = node.parentNode;
        }
        return stack.slice(1);
    }
    // 查找元素唯一路径 nodeJsPath
    nodeJsPath(node) {
        let stack = [];
        let value = node.value;
        let rect = node.getBoundingClientRect();
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
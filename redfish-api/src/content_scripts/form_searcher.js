
export default class FormSearcher {
    constructor(page_url) {
        this.page_url = page_url; // 当前页面URL
        this.selectors = []; // 输入框选择器
    }
    execute() {
        let elements = window.parent.document.getElementsByTagName("input");
        for (let i = 0; i < elements.length; i++) {
            let o = this.nodeJsPath(elements[i]);
            this.selectors.push(o);
        }
    }
    getSearchResult() {
        return {
            page_url: this.page_url,
            input_elements: this.selectors
        };
    }
    getElementCountByClassName(className) {
        let elements = document.getElementsByClassName(className);
        return elements.length;
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
        return { path: stack.join(" > "), value: value };
    }
}
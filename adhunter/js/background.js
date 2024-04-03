chrome.contextMenus.create({
    title: "广告猎手",
    onclick: function(){alert('广告猎手');},
	documentUrlPatterns: ['https://blog.csdn.net/*',
	'https://www.cnblogs.com/*'] // 只在某些页面显示此右键菜单
});

chrome.webRequest.onBeforeRequest.addListener(
    function(details){
        return {cancel: true};
    },
    {
        urls: ["http://webpack.wuhaolin.cn/gitbook/gitbook-plugin-modal/index.js"],
        types:[
        	"script"
        ]
    },
    [
        "blocking"
    ]
);
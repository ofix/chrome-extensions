const init = () => {
  const injectContentPage = (id, page_url) => {
    const inject_iframe = document.createElement("iframe");
    inject_iframe.id = id;
    inject_iframe.style.cssText =
      "width: 100%; height: 40%; position: fixed; left:-100%; top:60%; z-index: 10000002; border: none;";
    const page_src = chrome.runtime.getURL(page_url);
    inject_iframe.src = page_src;
    document.body.appendChild(inject_iframe);
  };
  console.log("inject iframe content page");
  // 注入iframe页面
  injectContentPage("content-start-iframe", "content_pages/index.html");
};

init();

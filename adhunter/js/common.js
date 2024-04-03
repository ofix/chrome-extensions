var adUrls = {
  "blog.csdn.net": [CSDN, 1],
  "www.cnblogs.com": [CnBlogs],
  "www.baidu.com": [BaiDu, 1],
  "www.yiibai.com": [YiiBai],
  "www.jianshu.com": [JianShu],
  "www.sass.hk": [Sass],
  "webpack.wuhaolin.cn": [Webpack, 1],
  "www.jb51.net": [jb51, 1],
};

var map = {
  "blog.csdn.net": "CSDN",
  "www.cnblogs.com": "博客园",
  "www.baidu.com": "百度",
  "www.yiibai.com": "yiibai",
};

gPrint = 0;

function jb51() {
  gAdElements = [
    ".mainlr",
    ".blank5",
    "#txtlink",
    "#imgRow0",
    ".topimg",
    ".logo",
    ".logom",
    ".article-content .lbd",
    "iframe",
    ".jb51ewm",
    ".article-right .r300",
    ".logor",
    "#pic_container",
    "#google_center_div",
    ".adsbygoogle",
  ];
  $("script").remove();
}

function Webpack() {
  $("iframe").remove();
  if (window.location.href == "http://webpack.wuhaolin.cn") {
    printBook();
    return false;
  }
  $(".book-body").css("overflow-y", "visible");
  gAdElements = [
    ".github-stargazers",
    ".github-me",
    ".book-header",
    ".navigation-prev",
    ".navigation-next",
  ];
  if (gPrint == 0) {
    setTimeout(function () {
      document.execCommand("print");
    }, 500);
    gPrint = 1;
  }
}

function printBook() {
  var pages = [];
  $("a").each(function () {
    var href = $(this).attr("href");
    if (/^http.*/.test(href)) {
      return true;
    }
    if (href == undefined) {
      return true;
    }
    if (/^\..*/.test(href)) {
      return true;
    }
    if (/^#.*/.test(href)) {
      return true;
    }
    var index = $.inArray(href, pages);
    if (index >= 0) {
    } else {
      pages.push(href);
    }
  });
  for (var i = 0, len = pages.length; i < len; i++) {
    var url = "http://webpack.wuhaolin.cn/" + pages[i];
    setTimeout(function () {
      window.open(url, "_blank");
    }, 5 * i + 500);
  }
  return pages;
}

//sass
function Sass() {
  gAdElements = [".gg"];
}

//CSDN
function CSDN() {
  gAdElements = [
    "iframe",
    "#adAways",
    "header",
    ".t0",
    ".persion_article",
    ".article-bar-bottom",
    ".pulllog-box",
    ".p4course_target",
    ".pulllog-box",
    ".meau-gotop-box",
    "#pic_container",
    ".answer-box",
    "#_kfgdmxteyi",
    ".pic_container",
    ".newsfeed",
    ".box-box-large",
    ".bdsharebuttonbox",
    "#_360_interactive",
    "#asideNewComments",
    ".mb8",
    ".custom-box",
    ".box-box-always",
    ".box-box-default",
    ".box-box-aways",
    ".blog_container_aside",
    ".left-toolbox",
    "#rightAside",
    ".csdn-side-toolbar",
    "#recommendNps",
    ".blog-footer-bottom",
    "#treeSkill",
    ".article-info-box",
    "#blogColumnPayAdvert",
  ];
  gNavigator = [
    "#csdn-toolbar",
    ".comment-box",
    "#asideArchive",
    ".related-article",
    "#asideHotArticle",
    ".meau-list",
    "#asideProfile",
    "#asideNewArticle",
    "#asideCategory",
    ".recommend-box",
    ".recommend-box-ident",
    "._4paradigm_box",
  ];
  gComputeElements = [[".blog-content-box", { left: "-15%" }]];
  padEle(".comment-box");
}
//博客园
function CnBlogs() {
  gAdElements = [
    "#right",
    "#mystats",
    "#bnr_pic",
    "#MySignature",
    "#blog_post_info_block",
    ".postDesc",
    "#comment_form",
    "#footer",
    "#blog-comments-placeholder",
  ];
  gNavigator = ["#mylinks", "#sideBar", "#mylinks", "#sideBar", "#header"];
  gComputeElements = [
    ["#left", { left: "0px", top: "0px" }],
    [".post", { border: "none;" }],
    ["#mainContent", { "margin-left": "150px", "margin-right": "150px" }],
    ["body", { background: "" }],
  ];
}
//YiiBai
function YiiBai() {
  gAdElements = [
    "#google_image_div",
    "#adContent-clickOverlay",
    "#adv-javalive",
    "#adContent",
    "iframe",
    ".adsbygoogle",
    "#footer-copyright",
    ".footer",
  ];
}
//简书
function JianShu() {
  gAdElements = [
    ".navbar",
    "#web-note-ad-fixed",
    ".author",
    ".support-author",
    ".show-foot",
    ".follow-detail",
    ".meta-bottom",
    "#web-note-ad-1",
    ".comment-list",
    ".normal-comment-list",
  ];
  gNavigator = [".side-tool", ".note-bottom"];
  padEle(".show-content");
}
//百度
function BaiDu() {
  var $normal_ads = $("span:contains('广告')");
  var $brand_ads = $("a:contains('品牌广告')");
  function removeItem(v) {
    var $this = $(v);
    var i = 0;
    while ($this.parent().attr("id") !== "content_left" && i < 10) {
      $this = $this.parent();
      i++;
    }
    if ($this.parent().attr("id") === "content_left") {
      $this.hide();
    }
  }
  $normal_ads.each(function (i, v) {
    removeItem(v);
  });
  $brand_ads.each(function (i, v) {
    removeItem(v);
  });
  $(".s_btn").one("click", function () {
    killAdTimeout(true);
  });
}

function getUrlCategory() {
  var host = window.location.host;
  if (adUrls.hasOwnProperty(host)) {
    return map[host];
  }
  return "";
}

function hiddenAdElements() {
  gAdElements.forEach(function (v, i, a) {
    $(v).remove();
  });
  gMode = 0;
}
function hiddenNavElements() {
  gNavigator.forEach(function (v, i, a) {
    $(v).hide().width(0).height(0).css("overflow", "hidden");
  });
}
function killAd() {
  var host = window.location.host;
  try {
    if (adUrls.hasOwnProperty(host)) {
      if (adUrls[host].length === 1) {
        hiddenAdElements();
        adUrls[host][0]();
      } else {
        var count = 0;
        hiddenAdElements();
        adUrls[host][0]();
        count++;
        var timer = setInterval(function () {
          //针对异步加载的情况
          hiddenAdElements();
          adUrls[host][0]();
          count++;
          if (count > 10) {
            clearInterval(timer);
          }
          console.log("adhunter定时次数: ", count);
        }, 500);
      } //end else
      installToolbar();
      saveNavigator();
      hiddenNavElements();
      pushComputeElements();
    }
    //去除搜索引擎的广告
    $(".qihoobannerslider").remove();
    var $iframe = $("iframe");
    for (var i = 0, len = $iframe.length; i < len; i++) {
      var src = $iframe.eq(i).attr("src");
      if (src !== undefined) {
        if (src.indexOf("baidu") !== -1 || src.indexOf(".googleads") !== -1) {
          $iframe.eq(i).remove();
          console.log("移除搜索引擎广告 ", src);
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
}

function saveNavigator() {
  if (gOriginCssStack.length == 0) {
    pushCssToStack(gNavigator);
  }
}

/**
 * @todo 保存CSS样式堆栈
 * @author code lighter
 * @date 2018/8/19 23:21:00
 */
var gOriginCssStack = [];
var gFixedCssStack = [];
var gMode = 0;
function pushCssToStack(elements) {
  elements.forEach(function (v, i, a) {
    var c = v.substr(0, 1);
    var ele;
    if (c === "#") {
      ele = document.getElementById(v.replace(/[#]/, ""));
    } else if (c === ".") {
      ele = document.querySelector(v);
    } else {
      ele = document.getElementsByTagName(v)[0];
    }
    if (ele === null || ele === undefined) {
      console.error("element " + v + " not found. ");
      return false;
    }
    if (ele != undefined) {
      var css = getElementAllCss(ele);
      gOriginCssStack.push([v, css]);
    }
  });
}
function popCssFromStack(elements) {
  gOriginCssStack.forEach(function (v, i, a) {
    $(v[0]).css("left", v[1][0]);
    $(v[0]).css("top", v[1][1]);
    $(v[0]).css("width", v[1][2]);
    $(v[0]).css("height", v[1][3]);
    $(v[0]).show();
  });
}
function popComputeElements() {
  gComputeBeforeCss.forEach(function (v, i, a) {
    var e = v[0];
    var css = v[1];
    $(e)
      .css("left", css[0])
      .css("top", css[1])
      .css("width", css[2])
      .css("height", css[3]);
  });
}
// function isArray(o){
//     return Object.prototype.toString.call(o) === '[object Array]';
// }
function getElementAllCss(element) {
  var css = !element.currentStyle
    ? window.getComputedStyle(element, null)
    : element.currentStyle;
  return [css.left, css.top, css.width, css.height];
}

/**
 *@todo 打印模式
 *@author code lighter
 *@date 2018/8/30
 */
$(document).on("keyup", function (e) {
  e = window.event || e || e.which;
  if (e.keyCode === 118) {
    //F7 ,F1 -112 F12 -123
    $(".star-list").toggle();
    $(".star").toggle();
    $(".compile-mode").toggle();
  }
});

/**
 * @todo 添加页面工具栏
 * @author code lighter
 * @date 2018/8/19 23:21:00
 */
var gEmitCss = 0;
var gEmitJs = 0;
var gEmitHtml = 0;
var gStarList = {};
var css = [];
function installToolbar() {
  emitToolbarCss();
  emitToolbarHtml();
  // emitToolbarJs();
}
//发射代码
function emitCode(code, ele) {
  $(ele).append(code);
}
function compile(code, template) {
  for (var i = 0, l = code.length + 1; i < l; i++) {
    pattern = /#\d+/;
    template = template.replace(pattern, code[i]);
  }
  return template;
}
function emitToolbarCss() {
  var code = [
    `.compile-mode,.star,.star-list{
            z-index:1000000 !important;
            width:120px;
            height:68px;
            line-height:68px;
            background-color:#D1B3DF;
            color:#714386;
            font-size:18px;
            text-align:center;
            position:fixed;
            cursor:pointer;
            display:none;
        }`,
    `.compile-mode{
            right:20px;
            bottom:20px;
        }`,
    `.star{
            right:20px;
            bottom:98px;
        }`,
    `.star-list{
            right:20px;
            bottom:174px;
        }`,
  ];
  var css = document.createElement("style");
  css.type = "text/css";
  css.appendChild(document.createTextNode(code.join(" ")));
  $(document.head).append(css);

  // var meta = '<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests"/>';
  // $(document.head).prepend(meta);
}

$(document).on("click", ".compile-mode", function () {
  if (gMode == 0 || gMode === undefined) {
    gMode = 1;
    popCssFromStack();
    popComputeElements();
  } else {
    gMode = 0;
    killAd();
  }
});
$(document).on("click", ".star", function () {
  var url = location.href;
  var title = document.title;
  // if(getStarBlog(url) == null){
  addStarBlog(title, url, getUrlCategory());
  // }else{
  //    delStarBlog(url);
  // }
});
$(document).on("click", ".star-list", function () {
  var list = queryStarList();
  var total = 0;
  list.forEach(function (v, i, a) {
    console.log(v);
    total++;
  });
  console.log("total item = ", total);
});

function queryStarList() {}
function getStarBlog(url) {
  console.log("getStarBlog url  = ", url);
  return chrome.storage.local.get(url.toString());
}
function addStarBlog(title, url, category) {
  $(document.body).append(
    '<iframe src="https://xch.com/index/save?url=' +
      url +
      "&title=" +
      title +
      "&category=" +
      category +
      '" width=0 height=0 frameborder="0" style="display:none;"></iframe>'
  );
}
function delStarBlog(url) {
  chrome.storage.local.remove(url.toString());
}

function emitToolbarJs(js, ele) {
  // if(gEmitJs>0){
  //     return;
  // }
  // gEmitJs++;
  // var code = [
  //      ``
  // ];
  // var js = document.createElement('script');
  // js.textContent = code.join(' ');
  // document.body.appendChild(js);
}
function emitToolbarHtml() {
  if (gEmitHtml > 0) {
    return;
  }
  gEmitHtml++;
  var template =
    '<div class="star-list">收藏夹</div><div class="star">收藏</div><div class="compile-mode">纯净模式</div>';
  $(document.body).append(template);
}

/**
 * @todo 将页面需要处理的元素进行分类
 * @author code lighter
 * @date 2018/8/19 23:21:00
 */
var gAdElements = []; //页面必须杀掉的广告元素
var gNavigator = []; //页面保留的导航元素
var gComputeElements = [];
var gComputeCss = []; //调整过的CSS
var gComputeBeforeCss = []; //调整前的CSS
function pushComputeElements() {
  if (gComputeCss.length === 0) {
    gComputeElements.forEach(function (v, i, a) {
      var ele = v[0];
      var computeCss = v[1];
      var $ele = $(ele);
      if ($ele[0]) {
        var css = getElementAllCss($ele[0]);
        gComputeBeforeCss.push([ele, css]);
        gComputeCss.push([ele, computeCss]);
      }
    });
  }
  gComputeCss.forEach(function (v, i, a) {
    $(v[0]).css(v[1]);
  });
}
function padEle(ele, isBefore = true) {
  var str = '<div style="margin-top:20px;background:none;"></div>';
  if (isBefore) {
    $(ele).before(str);
  }
}

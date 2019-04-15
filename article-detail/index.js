var restUrl = 'http://news.ytoutiao.net/yfax-news-api/api/htt/';

var headerAdDom = document.getElementById('header-ad');
var footerAdDom = document.getElementById('footer-ad');
var contentDom = document.getElementById('content');
// var contentReg = new RegExp('\"data\" : \{.*?\}');
// const projectnameReg = new RegExp('\"projectname\": \".*?\"');

function request(params) {
    var xhr = new XMLHttpRequest();
    xhr.open(params.method, params.url, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status >= 200 && xhr.status < 300) {
                var content = JSON.parse(xhr.responseText).data.content;
                contentDom.innerHTML = content;
            } else {
                console.error('request error');
            }
        }
    }
    xhr.send();
}
var params = {
    method: 'GET',
    url: restUrl + 'getDetailById?id=171122666'
};
request(params);

window.onload = function () {
    // 单图或者没图，1200px后展示
    var pTagArr = contentDom.getElementsByTagName('p');
    var imgTag = contentDom.getElementsByTagName('img');

    // 如果文章详情有图片，就在第二张图片后加载JS广告
    if (imgTag.length > 0) {
        var adScript = xsAd({
            url: '//www.smucdn.com/smu0/o.js',
            smua: 'd=m&s=b&u=u3736224&h=20:6'
        });
        // console.log(adScript);
        // console.log(typeof adScript);
        var insertAd = document.createElement('div');
        insertAd.id = 'insert-ad';
        insertAd.appendChild(adScript);

        var parentNode = imgTag[2].parentNode;
        parentNode.appendChild(insertAd);

    }
}

loadAd(headerAdDom, 'yz', {
    url: '//cdn.ipadview.com/jssdk/combo.bundle.js',
    product: 20035,
    code: 'ytth5a2019040801xxl'
});
loadAd(footerAdDom, 'zm', {
    url: 'http://i.hao61.net/d.js?cid=30843'
});
// loadAd(footerAdDom, 'xs', {
//     url: '//www.smucdn.com/smu0/o.js',
//     smua: 'd=m&s=b&u=u3736224&h=20:6'
// });

function loadAd(dom, type, params) {
    var adScript = null
    switch (type) {
        case 'yz':
            adScript = yzAd(params);
            break;
        case 'zm':
            adScript = zmAd(params);
            break;
        case 'xs':
            adScript = xsAd(params);
            break;
        default:
            console.log('没有匹配的广告商家～');
            break;
    }
    dom.appendChild(adScript);
}

// 阅赚
function yzAd(params) {
    var script = document.createElement("script");
    // script.async = true;
    // script.defer = "defer";
    script.dataset.product = params.product;
    script.dataset.androidChannal = params.code;
    script.dataset.iosChannal = params.code;
    script.src = params.url;

    return script;
}
// 众盟
function zmAd(params) {
    var script = document.createElement("script");
    // script.async = true;
    // script.defer = "defer";
    script.src = params.url;
    return script;
}
// 星拾
function xsAd(params) {
    var script = document.createElement("script");
    // script.async = true;
    // script.defer = "defer";
    script.setAttribute('smua', params.smua);
    script.src = params.url;
    return script;
}


function loadImg() {

    window.addEventListener('scroll', function (e) {
        var top = contentDom.scrollTop + contentDom.clientHeight;
        console.log('top', top);
        var imgArr = contentDom.querySelectorAll('p img');
        console.log(imgArr);
        imgArr.forEach(item => {
            console.log('offsetTop', item.offsetTop);
            if (item.offsetTop <= top) {
                item.setAttribute('src', item.dataset.src);
                // item.setAttribute('width',item.dataset.size.split(',')[0]);
                // item.setAttribute('height',item.dataset.size.split(',')[1]);
                item.setAttribute('width', '100%');
            }
        })
    });
}

loadImg();
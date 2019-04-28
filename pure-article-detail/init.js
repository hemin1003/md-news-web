function Detail() {
    this.base = {};
    // this.restUrl = 'http://47.95.35.210:9095/yfax-news-api/api/htt/';
    // this.reportUrl = 'http://182.92.82.188';
    this.restUrl = 'http://wnews.ytoutiao.net/yfax-news-api/api/htt/';
    this.likeUrl = 'http://incallnews.ytoutiao.net/yfax-news-api/api/htt/';
    this.reportUrl = 'http://and.ytoutiao.net';
    // this.queryrRedbagUrl = 'http://182.92.82.188/yfax-htt-api/api/htt/queryIsShowRedpaper';
    // this.doRedbagAwardUrl = 'http://182.92.82.188/yfax-htt-api/api/htt/doRedpaperAward';
    this.queryrRedbagUrl = 'http://and.ytoutiao.net/yfax-htt-api/api/htt/queryIsShowRedpaper';
    this.doRedbagAwardUrl = 'http://and.ytoutiao.net/yfax-htt-api/api/htt/doRedpaperAward';
    this.headerAdDom = null;
    this.footerAdDom = null;
    this.contentDom = null;
    this.insertAdDom = null;
    this.contentWrapper = null;
    this.moreBtn = null;
    this.bottomShadow = null;
    this.guessLikeListDom = null;
    this.likeList = [];
    this.adWrapperDomArr = [];
    this.toastDom = null;
    this.adArr = [
        {
            type: 'yz',
            params: {
                url: '//cdn.ipadview.com/jssdk/combo.bundle.js',
                product: 20035,
                code: 'ytth5a2019040802xxl'
            },
            isExposure: false,
            isClick: false
        },
        // {
        //     type: 'zm',
        //     params: {
        //         url: 'http://i.hao61.net/d.js?cid=30866'
        //     },
        //     isExposure: false,
        //     isClick: false
        // },
        // {
        //     type: 'xs',
        //     params: {
        //         url: '//www.smucdn.com/smu0/o.js',
        //         smua: 'd=m&s=b&u=u3736224&h=20:6'
        //     },
        //     isExposure: false,
        //     isClick: false
        // },
        {
            type: 'xs',
            params: {
                url: '//www.smucdn.com/smu0/o.js',
                smua: 'd=m&s=b&u=u3736229&h=20:6'
            },
            isExposure: false,
            isClick: false
        }
    ];
    // this.eventId = {
    //     exposure: 10000027,
    //     click: 10000028
    // };
    this.eventId = {
        exposure: 10000039,
        click: 10000031
    };
    this.version = '1.0.0';
    this.privatetKey = 'PVf7vlR6qYZAB5gU';
    this.privatetKey2 = 'SdJ1rbyInIhfwJas';
    this.clientHeight = document.documentElement.clientHeight;

    Detail.prototype._init = function () {

        // 如果webview开启允许缓存才执行下面的清缓存操作
        if (sessionStorage && localStorage) {

            // 清理 sessionStorage localStorage cookies

            sessionStorage.clear();
            localStorage.clear();

            var cookies = document.cookie.split(";");
            var domain = '.' + window.location.host;

            for (var i = 0; i < cookies.length; i++) {
                var cookie = cookies[i];
                var eqPos = cookie.indexOf("=");
                var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
                document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT; Domain=" + domain + "; path=/";
            }
            if (cookies.length > 0) {
                for (var i = 0; i < cookies.length; i++) {
                    var cookie = cookies[i];
                    var eqPos = cookie.indexOf("=");
                    var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
                    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT; Domain=" + domain + "; path=/";
                }
            }
        }

        // location search 存储
        var search = window.location.search.split('?')[1];
        var param = search.split('&');
        var tmp = {};
        for (var i = 0, length = param.length; i < length; i++) {
            var kv = param[i].split('=');
            tmp[kv[0]] = kv[1];
        }
        this.base = tmp;

        // dom准备
        this.headerAdDom = document.getElementById('header-ad');
        this.footerAdDom = document.getElementById('footer-ad');
        this.contentDom = document.getElementById('content');
        this.contentWrapper = document.querySelector('.content-wrapper');
        this.moreBtn = document.querySelector('.more-btn');
        this.bottomShadow = document.querySelector('.content-wrapper .bottom-shadow');
        this.guessLikeListDom = document.querySelector('.guess-like-list .list-content');
        this.redbagDom = document.querySelector('.redbag');
        this.toastDom = document.querySelector('.toast');

        // adArr 随机排序，取前3
        this.shuffle();

        // 加载详情
        this._loadDetailContent();

        // 加载阅读红包
        this._queryRedbag();

        // 绑定查看全文
        var that = this;
        this.moreBtn.addEventListener('click', function () {
            // 展开全文
            that.contentWrapper.style.height = 'auto';
            that.moreBtn.style.display = 'none';
            that.bottomShadow.style.display = 'none';
        });

        this.redbagDom.addEventListener('click', function () {
            that._doRedbagAward();
        });
    }

    Detail.prototype._getContentMountNode = function () {
        var that = this;

        var pTagArr = that.contentDom.getElementsByTagName('p');
        var imgTag = that.contentDom.getElementsByTagName('img');

        var insertAd = document.createElement('div');
        insertAd.id = 'insert-ad';

        // 如果文章详情有图片，就在第二张图片后加载JS广告
        if (imgTag.length > 1) {
            var parentNode = imgTag[2].parentNode;
            parentNode.appendChild(insertAd);
        } else {
            //如果单图或者没图，1200px后展示
            var parentNode = pTagArr[10];
            parentNode.appendChild(insertAd);
        }
        return insertAd;
    }

    Detail.prototype._loadAd = function (dom, data) {
        var adScript = null
        switch (data.type) {
            case 'yz':
                adScript = this._genYZAdScript(data.params);
                break;
            case 'zm':
                adScript = this._genZMAdScript(data.params);
                break;
            case 'xs':
                adScript = this._genXSAdScript(data.params);
                break;
            case 'xssg':
                return;
                break;
            default:
                console.log('没有匹配的广告商家～');
                break;
        }
        // 增加角标
        // var spanNode = document.createElement('span');
        // spanNode.innerHTML = data.type;
        // dom.appendChild(spanNode);

        dom.appendChild(adScript);
    }

    /**
     * 阅赚广告JS生成
     */
    Detail.prototype._genYZAdScript = function (params) {
        var script = document.createElement("script");
        // script.async = true;
        // script.defer = "defer";
        script.dataset.product = params.product;
        script.dataset.androidChannal = params.code;
        script.dataset.iosChannal = params.code;
        script.src = params.url;
        return script;
    }

    /**
     * 众盟广告JS生成
     */
    Detail.prototype._genZMAdScript = function (params) {
        var script = document.createElement("script");
        // script.async = true;
        // script.defer = "defer";
        script.src = params.url;
        return script;
    }

    /**
     * 星拾广告JS生成
     */
    Detail.prototype._genXSAdScript = function (params) {
        var script = document.createElement("script");
        // script.async = true;
        // script.defer = "defer";
        script.setAttribute('smua', params.smua);
        script.src = params.url;
        return script;
    }

    /**
     * 星拾搜狗广告JS生成
     */
    Detail.prototype._genXSSGAdScript = function (params) {
        var script = document.createElement("script");
        // script.async = true;
        // script.defer = "defer";
        script.type = 'text/javascript';
        script.src = params.url;
        return script;
    }

    /**
     * 绑定所有 ad-wrapper 
     */
    Detail.prototype._bindAdDom = function (params) {
        this.adWrapperDomArr = document.querySelectorAll('.ad-wrapper');
        // 补充 曝光，点击，填充 标志位
        for (var i = 0; i < this.adWrapperDomArr.length; i++) {
            this.adWrapperDomArr[i]['isExposure'] = false;
            this.adWrapperDomArr[i]['isClick'] = false;
            this.adWrapperDomArr[i]['isFill'] = false;
        }
    }

    /**
     * 生成猜你喜欢列表，混入广告Dom，用于后续 ad js 插入
     */
    Detail.prototype._generateGuessLikeList = function () {
        var list = this.likeList;
        var rstTemplate = '';
        // 列表头补充一个 ad
        rstTemplate += '<div class="ad-wrapper"><img src="./blank.png" alt="blank" width="100%"></div>'

        var baseInfo = this.base;
        for (var i = 0, length = list.length, step = 3; i < length; i++) {
            var newId = list[i].url.split('?')[1].split('=')[1];
            baseInfo.id = newId;
            baseInfo['go'] = 'gotoNews';

            var paramsStr = this.obj2str(baseInfo);

            var url = window.location.origin + window.location.pathname + '?' + paramsStr;
            if (list[i].imageList.length > 1) {
                rstTemplate += '<a class="news-wrapper" href="' + url + '">' +
                    '<div class="title">' + list[i].title + '</div>' +
                    '<div class="img-wrapper clearfix">' +
                    '<img src="' + list[i].imageList[0] + '" alt="img">' +
                    '<img src="' + list[i].imageList[1] + '" alt="img">' +
                    '<img src="' + list[i].imageList[2] + '" alt="img">' +
                    '</div>' +
                    '<div class="origin">' + list[i].category + '</div>' +
                    '</a>';
            } else {
                rstTemplate += '<a class="news-wrapper-single-img clearfix" href="' + url + '">' +
                    '<div class="left-wrapper">' +
                    '<div class="title-wrapper">' +
                    '<div class="title">' + list[i].title + '</div>' +
                    '</div>' +
                    '<div class="origin">' + list[i].category + '</div>' +
                    '</div>' +
                    '<div class="img-wrapper">' +
                    '<img src="' + list[i].imageList[0] + '" alt="img">' +
                    '</div>' +
                    '</a>';
            }

            if (--step === 0) {
                step = 3;
                rstTemplate += '<div class="ad-wrapper"><img src="./blank.png" alt="blank" width="100%"></div>'
            }
        }
        return rstTemplate;
    }

    Detail.prototype._loadDetailContent = function () {
        var that = this;
        var id = that.search2Obj().id;
        var params = {
            method: 'GET',
            url: this.restUrl + 'getDetailById?id=' + id,
            callback: function (res) {
                that.contentDom.innerHTML = res.data.content;

                // 时间下面插入分割线
                var lineNode = document.createElement('div');
                lineNode.setAttribute('class', 'line');
                var c = document.querySelector('#content .content');
                that.contentDom.insertBefore(lineNode, c);

                // 设置 title
                document.title = document.querySelector('#content h1').innerHTML;

                // 加载猜你喜欢
                that._loadGuessLikeList();

                // 加载图片
                var imgArr = that.contentDom.querySelectorAll('#content .content img');
                for (var i in imgArr) {
                    var src = imgArr[i].dataset.src;
                    imgArr[i].setAttribute('src', src);
                }


            }
        };
        that.request(params);
    }

    Detail.prototype._loadGuessLikeList = function () {
        var that = this;
        var title = document.querySelector('#content h1').innerHTML;
        var params = {
            method: 'GET',
            url: that.likeUrl + 'getLikeList?curPage=' + 1 + '&title=' + encodeURIComponent(title),
            callback: function (res) {
                that.likeList = that.likeList.concat(res.data.entityList);
                var params2 = {
                    method: 'GET',
                    url: that.likeUrl + 'getLikeList?curPage=' + 2 + '&title=' + encodeURIComponent(title),
                    callback: function (res) {
                        that.likeList = that.likeList.concat(res.data.entityList);
                        that.guessLikeListDom.innerHTML = that._generateGuessLikeList();

                        that._bindAdDom();
                    }
                };
                that.request(params2);

            }
        };
        that.request(params);

    }

    /**
     * 查询阅读红包
     */
    Detail.prototype._queryRedbag = function () {
        var that = this;
        var params = {
            method: 'GET',
            url: this.queryrRedbagUrl + '?' + 'phoneNum=' + this.base.clientId + '&primaryKey=' + md5(window.location.href) + '&access_token=' + this.base.access_token,
            callback: function (res) {
                if (parseInt(res.code, 10) === 200) {
                    that.redbagDom.childNodes[3].innerHTML = '点击领取' + res.data.gold + '金币';
                    that.redbagDom.style.display = 'block';
                } else {
                    that.redbagDom.style.display = 'none';
                }

            }
        };
        that.request(params);
    }

    /**
     * 阅读红包奖励
     */
    Detail.prototype._doRedbagAward = function () {
        var that = this;
        var baseInfo = this.base;
        var random = this._random(10);
        console.log(window.location.href);
        var formData = new FormData();
        formData.append('access_token', baseInfo.access_token);
        formData.append('platfrom', baseInfo.platfrom);
        formData.append('phoneNum', baseInfo.clientId);
        formData.append('primaryKey', md5(window.location.href));
        formData.append('mId', baseInfo.imei);
        formData.append('tId', baseInfo.tId);
        formData.append('sId', random + random);
        var preStr = '?platfrom=' + baseInfo.platfrom
            + '&phoneNum=' + baseInfo.clientId
            + '&primaryKey=' + md5(window.location.href)
            + '&mId=' + baseInfo.imei
            + '&tId=' + baseInfo.tId
            + '&sId=' + random + random
            + '&key=' + this.privatetKey2;

        formData.append('uId', md5(preStr));

        var params = {
            method: 'POST',
            url: this.doRedbagAwardUrl,
            body: formData,
            callback: function (res) {
                if (parseInt(res.code, 10) === 200) {
                    that.toastDom.childNodes[3].innerHTML = '+' + res.data.gold + '金币';
                    // that.toastDom.innerHTML = '恭喜获得 ' + 20 + ' 阅读金币';
                    that.toastDom.style.display = 'block';
                    that.redbagDom.innerHTML = '我也是有底线的';
                    setTimeout(function () {
                        that.toastDom.style.display = 'none';
                    }, 1500);
                }
            }
        };
        that.request(params);
    }

    Detail.prototype.request = function (params) {
        var xhr = new XMLHttpRequest();
        xhr.open(params.method, params.url, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 300) {
                    var data = JSON.parse(xhr.responseText);
                    params.callback && params.callback(data);
                } else {
                    console.error('request error');
                }
            }
        }
        if (params.method === 'get') {
            xhr.send(null);
        } else {
            xhr.send(params.body);
        }
    }

    Detail.prototype._exposureReport = function (params) {
        var rstParams = params;
        rstParams['eventId'] = this.eventId.exposure;

        var formData = this._prepareData(rstParams);
        var params = {
            url: this.reportUrl + '/yfax-htt-api/api/htt/doBurryPoint',
            method: 'POST',
            body: formData
        };
        this.request(params);
    }

    Detail.prototype._clickReport = function (params) {
        var rstParams = params;
        rstParams['eventId'] = this.eventId.click;

        var formData = this._prepareData(rstParams);
        var params = {
            url: this.reportUrl + '/yfax-htt-api/api/htt/doBurryPoint',
            method: 'POST',
            body: formData
        };
        this.request(params);
    }

    Detail.prototype._prepareData = function (params) {
        var sId = this._random(6);
        var baseInfo = this.base;

        var preStr = 'channel=article-detail-h5&dotSource=article-detail-h5&eventId=' + params.eventId
            + '&imei=' + baseInfo.imei
            + '&projectCode=' + baseInfo.projectCode
            + '&sId=' + sId
            + '&traceId=' + baseInfo.tId
            + '&version=' + this.version
            + '&secretKey=' + this.privatetKey;

        var sign = md5(preStr);

        var formData = new FormData();

        formData.append('projectCode', baseInfo.projectCode);
        formData.append('sId', sId);
        formData.append('eventId', params.eventId);
        formData.append('traceId', baseInfo.tId);
        formData.append('ip', '');
        formData.append('version', this.version);
        formData.append('channel', 'article-detail-h5');
        formData.append('dotSource', 'article-detail-h5');
        formData.append('phoneNum', baseInfo.clientId);
        formData.append('jsonParam', "");
        formData.append('imei', baseInfo.imei);
        formData.append('sign', sign.toUpperCase());

        // 细化的业务字段
        if (params.b1) {
            formData.append('b1', params.b1);
        }

        return formData;
    }

    Detail.prototype._random = function (length) {
        var str = Math.random().toString(36).substr(2);
        if (str.length >= length) {
            return str.substr(0, length);
        }
        str += random(length - str.length);
        return str;
    }

    Detail.prototype.shuffle = function () {
        var i = this.adArr.length, t, j;
        while (i) {
            j = Math.floor(Math.random() * i--);
            t = this.adArr[i];
            this.adArr[i] = this.adArr[j];
            this.adArr[j] = t;
        }
    }

    Detail.prototype.search2Obj = function () {
        var search = window.location.search.split('?')[1];
        var param = search.split('&');
        var paramsObj = {};
        for (var i = 0, length = param.length; i < length; i++) {
            var kv = param[i].split('=');
            paramsObj[kv[0]] = kv[1];
        }
        return paramsObj;
    }

    Detail.prototype.obj2str = function (obj) {
        var str = '';
        for (var j in obj) {
            str += j + '=' + obj[j] + '&'
        }
        return str;
    }
}

; (function () {
    var detail = new Detail();
    detail._init();

    var adLen = detail.adArr.length;
    var step = 0;
    // 滚动监听
    var timer = null;
    window.addEventListener('scroll', function () {
        // 截流，50ms间隔
        if (typeof timer === 'number') {
            clearTimeout(timer);
        }
        timer = setTimeout(function () {

            var _clientHeight = document.documentElement.clientHeight;

            for (var i = 0; i < detail.adWrapperDomArr.length; i++) {
                if (detail.adWrapperDomArr[i].getBoundingClientRect().top <= _clientHeight && !detail.adWrapperDomArr[i].isFill) {
                    if (detail.adWrapperDomArr[i].dataset.type === 'bd') {
                        detail.adWrapperDomArr[i].isFill = true;
                        detail.adWrapperDomArr[i].isExposure = true;
                        detail._exposureReport({
                            b1: 'bd'
                        });
                    } else if (detail.adWrapperDomArr[i].dataset.type === 'sg') {
                        detail.adWrapperDomArr[i].isFill = true;
                        detail.adWrapperDomArr[i].isExposure = true;
                        detail._exposureReport({
                            b1: 'sg'
                        });
                    } else {
                        detail.adWrapperDomArr[i].isFill = true;
                        detail.adWrapperDomArr[i].innerHTML = '';
                        detail._loadAd(detail.adWrapperDomArr[i], detail.adArr[step]);

                        // 曝光上报
                        detail.adWrapperDomArr[i].isExposure = true;
                        detail._exposureReport({
                            b1: detail.adArr[step].type
                        });

                        // 步进器自增或重置
                        if (++step >= adLen) {
                            step = 0;
                        }
                    }
                }
            }

            // test 显示
            // document.getElementById('fixHeader').innerHTML =
            //     '<div>clientHeight:' + document.documentElement.clientHeight + '</div>'
            //     + '<div>guessLikeListDom top:' + detail.guessLikeListDom.getBoundingClientRect().top + '</div>';

        }, 50);

    }, false);

}())

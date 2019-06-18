/***
 *
 *   █████▒█    ██  ▄████▄   ██ ▄█▀       ██████╗ ██╗   ██╗ ██████╗
 * ▓██   ▒ ██  ▓██▒▒██▀ ▀█   ██▄█▒        ██╔══██╗██║   ██║██╔════╝
 * ▒████ ░▓██  ▒██░▒▓█    ▄ ▓███▄░        ██████╔╝██║   ██║██║  ███╗
 * ░▓█▒  ░▓▓█  ░██░▒▓▓▄ ▄██▒▓██ █▄        ██╔══██╗██║   ██║██║   ██║
 * ░▒█░   ▒▒█████▓ ▒ ▓███▀ ░▒██▒ █▄       ██████╔╝╚██████╔╝╚██████╔╝
 *  ▒ ░   ░▒▓▒ ▒ ▒ ░ ░▒ ▒  ░▒ ▒▒ ▓▒       ╚═════╝  ╚═════╝  ╚═════╝
 *  ░     ░░▒░ ░ ░   ░  ▒   ░ ░▒ ▒░
 *  ░ ░    ░░░ ░ ░ ░        ░ ░░ ░
 *           ░     ░ ░      ░  ░
 */

function Detail() {
    this.base = {};
    this.restUrl = 'http://and.ytoutiao.net/yfax-htt-api/api/htt/';
    // this.restUrl = 'http://182.92.82.188/yfax-htt-api/api/htt/';
    this.likeUrl = 'http://incallnews.ytoutiao.net/yfax-news-api/api/htt/';
    // this.reportUrl = 'http://182.92.82.188';
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
    this.isLoadGuessLikeList = false;
    this.adWrapperDomArr = [];
    this.isLoadNextAdWrapperDom = false;
    this.toastDom = null;
    this.imgArr = [];
    this.likeListImgArr = [];
    this.adArr = [];
    this.eventId = {
        exposure: 10000039,
        click: 10000031
    };
    this.version = '1.0.0';
    this.privatetKey = 'PVf7vlR6qYZAB5gU';
    this.privatetKey2 = 'SdJ1rbyInIhfwJas';
    this.clientHeight = document.documentElement.clientHeight;

    Detail.prototype._init = function () {

        // 清空缓存
        // this.clearStorage();

        // location search 存储
        var search = window.location.search.split('?')[1];
        var param = search.split('&');
        var tmp = {};
        for (var i = 0, length = param.length; i < length; i++) {
            var kv = param[i].split('=');
            tmp[kv[0]] = kv[1];
        }

        // 处理 adsParamJsonObj
        var adsParamJsonObj = decodeURIComponent(tmp.adsParamJson).split('&');
        for (var i = 0, length = adsParamJsonObj.length; i < length; i++) {
            var kv = adsParamJsonObj[i].split('=');
            adsParamJsonObj[kv[0]] = kv[1];
        }
        tmp.adsParamJson = {
            point: 2011,
            ua: adsParamJsonObj['ua'],
            device: adsParamJsonObj['device'],
            dynamicParam: adsParamJsonObj['dynamicParam']
        };

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
        // 绑定领取红包
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

    /**
     * ad response to ad object
     */
    Detail.prototype._response2Object = function (type, res) {
        var rstAdArr = [];
        switch (type) {
            case 'owner':
                for (var i in res) {
                    var tmpObj = {};
                    tmpObj['type'] = 'owner';
                    tmpObj['params'] = res[i];
                    tmpObj['isExposure'] = false;
                    tmpObj['isClick'] = false;

                    rstAdArr.push(tmpObj);
                }
                break;
            case 'xs':
                for (var i in res.jsAdsIdArray) {
                    var tmpObj = {};
                    tmpObj['type'] = 'xs';
                    tmpObj['id'] = res.jsAdsIdArray[i].split('#')[0];
                    tmpObj['reportId'] = res.jsAdsIdArray[i];
                    var paramsObj = {};

                    paramsObj['url'] = '//www.smucdn.com/smu0/o.js';
                    paramsObj['smua'] = 'd=m&s=b&u=' + res.jsAdsIdArray[i].split('#')[0] + '&h=20:6';
                    tmpObj['params'] = paramsObj;

                    tmpObj['isExposure'] = false;
                    tmpObj['isClick'] = false;

                    rstAdArr.push(tmpObj);
                }

                break;
            case 'zm':
                for (var i in res.jsAdsIdArray) {
                    var tmpObj = {};
                    tmpObj['type'] = 'zm';
                    tmpObj['id'] = res.jsAdsIdArray[i].split('#')[0];
                    tmpObj['reportId'] = res.jsAdsIdArray[i];
                    var paramsObj = {};

                    paramsObj['url'] = 'http://i.hao61.net/d.js?cid=' + res.jsAdsIdArray[i].split('#')[0];
                    tmpObj['params'] = paramsObj;

                    tmpObj['isExposure'] = false;
                    tmpObj['isClick'] = false;

                    rstAdArr.push(tmpObj);
                }
                break;
            case 'pp':
                for (var i in res.jsAdsIdArray) {
                    var tmpObj = {};
                    tmpObj['type'] = 'pp';
                    tmpObj['id'] = res.jsAdsIdArray[i].split('#')[0];
                    tmpObj['reportId'] = res.jsAdsIdArray[i];
                    var paramsObj = {};

                    paramsObj['url'] = '//www.smucdn.com/smu0/o.js';
                    paramsObj['smua'] = 'd=m&s=b&u=' + res.jsAdsIdArray[i].split('#')[0] + '&h=20:6';
                    tmpObj['params'] = paramsObj;

                    tmpObj['isExposure'] = false;
                    tmpObj['isClick'] = false;

                    rstAdArr.push(tmpObj);
                }

                break;
            case 'wx':
                for (var i in res.jsAdsIdArray) {
                    var tmpObj = {};
                    tmpObj['type'] = 'wx';
                    tmpObj['id'] = res.jsAdsIdArray[i].split('#')[0];
                    tmpObj['reportId'] = res.jsAdsIdArray[i];
                    var paramsObj = {};

                    paramsObj['url'] = '//www.smucdn.com/smu0/o.js';
                    paramsObj['smua'] = 'd=m&s=b&u=' + res.jsAdsIdArray[i].split('#')[0] + '&h=20:6';
                    tmpObj['params'] = paramsObj;

                    tmpObj['isExposure'] = false;
                    tmpObj['isClick'] = false;

                    rstAdArr.push(tmpObj);
                }

                break;
            case 'yn':
                for (var i in res.jsAdsIdArray) {
                    var tmpObj = {};
                    tmpObj['type'] = 'yn';
                    tmpObj['id'] = res.jsAdsIdArray[i].split('#')[0];
                    tmpObj['reportId'] = res.jsAdsIdArray[i];
                    var paramsObj = {};

                    paramsObj['url'] = '//un.wwlolbs.com/yn/moblie.min.js';
                    paramsObj['yn'] = 'codeId=' + res.jsAdsIdArray[i].split('#')[0] + '&node=false&adStyle=emf';
                    tmpObj['params'] = paramsObj;

                    tmpObj['isExposure'] = false;
                    tmpObj['isClick'] = false;

                    rstAdArr.push(tmpObj);
                }

                break;
            default:
                break;
        }

        this.adArr = this.adArr.concat(rstAdArr);

        console.log('---------当前 adArr ---------');
        console.log(this.adArr);
        console.log('---------当前 adArr ---------');

        // adArr 随机排序，取前3
        // this.shuffle();

        // 加载猜你喜欢
        // 全局只加载一次
        if (!this.isLoadGuessLikeList) {
            this.isLoadGuessLikeList = true;
            this._loadGuessLikeList();
        }

    }

    Detail.prototype._loadAd = function (dom, data, index) {
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
            case 'pp':
                adScript = this._genXSAdScript(data.params);
                break;
            case 'wx':
                adScript = this._genXSAdScript(data.params);
                break;
            case 'yn':
                adScript = this._genYNAdScript(data.params);
                break;
            case 'owner':
                dom.setAttribute('index', index);
                adScript = this._genOwnerAdDom(data.params);
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

    Detail.prototype._loadAllAd = function (next) {
        console.log('_loadAllAd...');
        var step = 0;
        if (this.adArr.length !== 0) {
            console.log('this.adArr.length', this.adArr.length);
            console.log('this.adWrapperDomArr.length', this.adWrapperDomArr.length);
            if (!next) {
                for (var i = 0; i < this.adWrapperDomArr.length / 2; i++) {

                    this.adWrapperDomArr[i].isFill = true;
                    this.adWrapperDomArr[i].innerHTML = '';
                    this._loadAd(this.adWrapperDomArr[i], this.adArr[step], step);

                    console.log('step', step);
                    console.log(this.adArr[step]);

                    this.adWrapperDomArr[i].isExposure = true;
                    // 自有广告上报
                    if (this.adArr[step].type === 'owner') {
                        this._ownerExposureReport(this.adArr[step].params);
                    } else {
                        // 
                        // 曝光上报
                        this._exposureReport({
                            b1: this.adArr[step].type,
                            b2: this.adArr[step].id + '#' + window.location.host
                        });

                        // MTA曝光上报
                        MtaH5.clickStat('pure_article_detail_exposure', { 'xsu3729957': 'true' });
                    }
                    ++step;
                }
            } else {
                for (var i = this.adWrapperDomArr.length / 2; i < this.adWrapperDomArr.length; i++) {

                    this.adWrapperDomArr[i].isFill = true;
                    this.adWrapperDomArr[i].innerHTML = '';
                    this._loadAd(this.adWrapperDomArr[i], this.adArr[step], step);

                    console.log('step', step);
                    console.log(this.adArr[step]);

                    this.adWrapperDomArr[i].isExposure = true;
                    // 自有广告上报
                    if (this.adArr[step].type === 'owner') {
                        this._ownerExposureReport(this.adArr[step].params);
                    } else {
                        // 
                        // 曝光上报
                        this._exposureReport({
                            b1: this.adArr[step].type,
                            b2: this.adArr[step].id + '#' + window.location.host
                        });

                        // MTA曝光上报
                        MtaH5.clickStat('pure_article_detail_exposure', { 'xsu3729957': 'true' });
                    }
                    ++step;
                }
            }
        }
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
     * 赢纳广告JS生成
     */
    Detail.prototype._genYNAdScript = function (params) {
        var script = document.createElement("script");
        // script.async = true;
        // script.defer = "defer";
        script.dataset.yn = params.yn;
        script.src = params.url;
        return script;
    }

    Detail.prototype._genOwnerAdDom = function (params) {
        var dom = document.createElement("div");
        // 根据 type 生成不同样式的 ad
        var rstTemplate = '';
        switch (params.type) {
            case 0:
                rstTemplate += '<a class="news-wrapper-big-img" href="' + params.url + '">' +
                    '<div class="title">' + params.title + '</div>' +
                    '<div class="img-wrapper clearfix">' +
                    '<img src="' + params.imgUrl + '" alt="img">' +
                    '<div class="label">广告</div>' +
                    '</div>' +
                    '<div class="origin">智能推荐</div>' +
                    '</a>';
                break;
            case 1:
                rstTemplate += '<a class="news-wrapper-single-img clearfix" href="' + params.url + '">' +
                    '<div class="left-wrapper">' +
                    '<div class="title-wrapper">' +
                    '<div class="title">' + params.title + '</div>' +
                    '</div>' +
                    '<div class="origin">智能推荐</div>' +
                    '</div>' +
                    '<div class="img-wrapper">' +
                    '<img src="' + params.imgUrl + '" alt="img">' +
                    '</div>' +
                    '<div class="label">广告</div>' +
                    '</a>';
                break;
            case 2:
                rstTemplate += '<a class="news-wrapper" href="' + params.url + '">' +
                    '<div class="title">' + params.title + '</div>' +
                    '<div class="img-wrapper clearfix">' +
                    '<img src="' + params.imgUrl + '" alt="img">' +
                    '<img src="' + params.extImgUrl[0] + '" alt="img">' +
                    '<img src="' + params.extImgUrl[1] + '" alt="img">' +
                    '<div class="label">广告</div>' +
                    '</div>' +
                    '<div class="origin">智能推荐</div>' +
                    '</a>';
                break;
            default: break;

        }
        dom.innerHTML = rstTemplate;
        return dom;
    }

    /**
     * 绑定所有 ad-wrapper 
     */
    Detail.prototype._bindAdDom = function (params) {
        this.adWrapperDomArr = document.querySelectorAll('.ad-wrapper');
        var that = this;
        // 补充 曝光，点击，填充 标志位
        for (var i = 0; i < this.adWrapperDomArr.length; i++) {
            this.adWrapperDomArr[i]['isExposure'] = false;
            this.adWrapperDomArr[i]['isClick'] = false;
            this.adWrapperDomArr[i]['isFill'] = false;

            // 绑定点击事件
            this.adWrapperDomArr[i].addEventListener('click', function (e) {
                var index = parseInt(e.currentTarget.getAttribute('index'), 10);
                that._ownerClickReport(that.adArr[index].params);
            });
        }
    }

    /**
     * 生成猜你喜欢列表，混入广告Dom，用于后续 ad js 插入
     */
    Detail.prototype._generateGuessLikeList = function () {
        var list = this.likeList;
        var rstTemplate = '';

        // 如果adArr为空，不插入广告位
        if (this.adArr.length * 2 > 1) {
            // 列表头补充一个 ad
            rstTemplate += '<div class="ad-wrapper"><img src="./blank.png" alt="blank" width="100%"></div>'
        }

        var baseInfo = this.base;
        var adsParamJson = this.obj2str(baseInfo.adsParamJson);
        var encodeAdsParamJson = encodeURIComponent(adsParamJson);
        for (var i = 0, length = list.length, step = 3, adLen = this.adArr.length * 2 - 2; i < length; i++) {
            var newId = list[i].url.split('?')[1].split('=')[1];
            baseInfo.id = newId;
            // 解决 undefined 错误
            baseInfo.adsParamJson = encodeAdsParamJson;
            baseInfo['go'] = 'gotoNews';

            var paramsStr = this.obj2str(baseInfo);

            var url = window.location.origin + window.location.pathname + '?' + paramsStr;
            if (list[i].imageList.length > 1) {
                rstTemplate += '<a class="news-wrapper" href="' + url + '">' +
                    '<div class="title">' + list[i].title + '</div>' +
                    '<div class="img-wrapper clearfix">' +
                    '<img data-src="' + list[i].imageList[0] + '">' +
                    '<img data-src="' + list[i].imageList[1] + '">' +
                    '<img data-src="' + list[i].imageList[2] + '">' +
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
                    '<img data-src="' + list[i].imageList[0] + '">' +
                    '</div>' +
                    '</a>';
            }

            // 按广告数量，插入广告位，最多8个
            if (adLen > 0 && --step === 0) {
                --adLen;
                step = 3;
                rstTemplate += '<div class="ad-wrapper"><img src="./blank.png" alt="blank" width="100%"></div>'
            }
        }
        return rstTemplate;
    }

    Detail.prototype._queryJsAdsSource = function () {
        var that = this;
        var base = that.base;
        var params = {
            method: 'GET',
            url: that.restUrl + 'queryJsAdsSource?domain=' + window.location.host + '&channel=article-detail-h5' + '&versionCode=' + that.version + '&phoneNum=' + base.clientId,
            // url: that.restUrl + 'queryJsAdsSource?domain=' + '115.29.66.197:81' + '&channel=article-detail-h5' + '&versionCode=' + that.version + '&phoneNum=' + base.clientId,
            callback: function (res) {

                var source = res.data;
                if (parseInt(source.jsAdsSource, 10) === -1) {
                    // 请求自有
                    that._getOwnerAd();
                } else {
                    that._response2Object(source.jsAdsSource, source);
                }
            }
        };
        that.request(params);
    }

    Detail.prototype._getOwnerAd = function () {
        var that = this;
        var params = {
            method: 'GET',
            url: that.restUrl + 'adserving?' + that.obj2str(that.base.adsParamJson),
            callback: function (res) {
                that._response2Object('owner', res.data);
            }
        };
        that.request(params);
    }

    /**
     * 请求自有填充到第三方尾部
     */
    Detail.prototype._getOwnerAd2Fill = function (source) {
        var that = this;
        var params = {
            method: 'GET',
            url: that.restUrl + 'adserving?' + that.obj2str(that.base.adsParamJson),
            callback: function (res) {
                // 重复一次
                source.jsAdsIdArray = source.jsAdsIdArray.concat(source.jsAdsIdArray);
                that._response2Object(source.jsAdsSource, source);
                // 自有填充到尾部
                that._response2Object('owner', res.data);
            }
        };
        that.request(params);
    }

    Detail.prototype._loadDetailContent = function () {
        var that = this;
        var id = that.search2Obj().id;
        var params = {
            method: 'GET',
            url: 'http://wnews.ytoutiao.net/yfax-news-api/api/htt/getDetailById?id=' + id,
            callback: function (res) {
                that.contentDom.innerHTML = res.data.content;

                // 时间下面插入分割线
                var lineNode = document.createElement('div');
                lineNode.setAttribute('class', 'line');
                var c = document.querySelector('#content .content');
                that.contentDom.insertBefore(lineNode, c);

                // 设置 title
                document.title = document.querySelector('#content h1').innerHTML;

                // 确定本次加载的广告
                that._queryJsAdsSource();

                // 绑定图片DOM
                var contentDomImgs = that.contentDom.querySelectorAll('#content .content img');
                that.imgArr = contentDomImgs;

                // 详情加载完，先执行一次图片加载
                that._lazyLoadImg();

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

                        // 一次性加载所有广告
                        that._loadAllAd();

                        var guessLikeListDomImgs = that.guessLikeListDom.querySelectorAll('img');
                        that.likeListImgArr = guessLikeListDomImgs;
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

    Detail.prototype._ownerExposureReport = function (params) {

        var baseInfo = this.base;

        var formData = new FormData();
        formData.append('phoneNum', baseInfo.clientId);
        formData.append('adsSource', 'ADS_MD_API');
        formData.append('adsType', params.adsType);
        formData.append('adsId', params.pid);
        formData.append('tabName', baseInfo.tabName);
        formData.append('title', params.title);
        formData.append('url', params.url);
        formData.append('actionType', 1);
        formData.append('ip', baseInfo.mIp);
        formData.append('appVersion', baseInfo.appVersion);
        formData.append('appChannel', baseInfo.appChannel);
        formData.append('appImei', baseInfo.imei);
        formData.append('pce', params.pce);
        formData.append('point', params.point);

        var params = {
            url: this.reportUrl + '/yfax-htt-api/api/htt/doBurryPointAdsHis',
            method: 'POST',
            body: formData
        };
        this.request(params);
    }

    Detail.prototype._ownerClickReport = function (params) {
        var baseInfo = this.base;

        var formData = new FormData();
        formData.append('phoneNum', baseInfo.clientId);
        formData.append('adsSource', 'ADS_MD_API');
        formData.append('adsType', params.adsType);
        formData.append('adsId', params.pid);
        formData.append('tabName', baseInfo.tabName);
        formData.append('title', params.title);
        formData.append('url', params.url);
        formData.append('actionType', 2);
        formData.append('ip', baseInfo.mIp);
        formData.append('appVersion', baseInfo.appVersion);
        formData.append('appChannel', baseInfo.appChannel);
        formData.append('appImei', baseInfo.imei);
        formData.append('pce', params.pce);
        formData.append('point', params.point);

        var params = {
            url: this.reportUrl + '/yfax-htt-api/api/htt/doBurryPointAdsHis',
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
        if (params.b2) {
            formData.append('b2', params.b2);
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
        paramsObj.adsParamJson = decodeURIComponent(paramsObj.adsParamJson);
        // console.log(paramsObj.adsParamJson);
        // this.headerAdDom.innerHTML = paramsObj.adsParamJson;
        return paramsObj;
    }

    Detail.prototype.obj2str = function (obj) {
        var str = '';
        for (var j in obj) {
            str += j + '=' + obj[j] + '&'
        }
        return str;
    }

    Detail.prototype.clearStorage = function () {
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
    }

    Detail.prototype.mtaXSu3729957 = function () {
        MtaH5.clickStat('pure_article_detail_exposure', { 'xsu3729957': 'true' });
    }

    Detail.prototype.mtaXSu3729950 = function () {
        MtaH5.clickStat('pure_article_detail_exposure', { 'xsu3729950': 'true' });
    }

    Detail.prototype._lazyLoadImg = function () {

        var _clientHeight = document.documentElement.clientHeight;
        for (var i = 0; i < this.imgArr.length; i++) {
            if (this.imgArr[i].getBoundingClientRect().top <= _clientHeight && this.imgArr[i].getAttribute('src') === null) {
                var src = this.imgArr[i].dataset.src;
                this.imgArr[i].setAttribute('src', src);
            }
        }

        for (var i = 0; i < this.likeListImgArr.length; i++) {
            if (this.likeListImgArr[i].getBoundingClientRect().top <= _clientHeight && this.likeListImgArr[i].getAttribute('src') === null) {
                var src = this.likeListImgArr[i].dataset.src;
                this.likeListImgArr[i].setAttribute('src', src);
            }
        }
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

            if (detail.adArr.length !== 0) {
                // 广告位懒加载
                var _clientHeight = document.documentElement.clientHeight;

                if (detail.adWrapperDomArr[1].getBoundingClientRect().top <= _clientHeight && !detail.isLoadNextAdWrapperDom) {
                    detail.isLoadNextAdWrapperDom = true;
                    detail._loadAllAd(detail.isLoadNextAdWrapperDom);

                    // if (detail.adWrapperDomArr[i].dataset.type === 'bd') {
                    //     detail.adWrapperDomArr[i].isFill = true;
                    //     detail.adWrapperDomArr[i].isExposure = true;
                    //     detail._exposureReport({
                    //         b1: 'bd'
                    //     });
                    // } else if (detail.adWrapperDomArr[i].dataset.type === 'sg') {
                    //     detail.adWrapperDomArr[i].isFill = true;
                    //     detail.adWrapperDomArr[i].isExposure = true;
                    //     detail._exposureReport({
                    //         b1: 'sg'
                    //     });
                    // } else {
                    //     // detail.adWrapperDomArr[i].isFill = true;
                    //     // detail.adWrapperDomArr[i].innerHTML = '';
                    //     // detail._loadAd(detail.adWrapperDomArr[i], detail.adArr[step], step);

                    //     detail.adWrapperDomArr[i].isExposure = true;
                    //     // 自有广告上报
                    //     if (detail.adArr[step].type === 'owner') {
                    //         detail._ownerExposureReport(detail.adArr[step].params);
                    //     } else {
                    //         // 
                    //         // 曝光上报
                    //         detail._exposureReport({
                    //             b1: detail.adArr[step].type,
                    //             b2: detail.adArr[step].id + '#' + window.location.host
                    //         });

                    //         // MTA曝光上报
                    //         MtaH5.clickStat('pure_article_detail_exposure', { 'xsu3729957': 'true' });
                    //     }
                    //     // 步进器自增或重置
                    //     // if (++step >= detail.adArr.length) {
                    //     //     step = 0;
                    //     // }
                    //     ++step;
                    // }
                }
            }

            // 图片懒加载
            detail._lazyLoadImg();

        }, 50);

    }, false);

}())
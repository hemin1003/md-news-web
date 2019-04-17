function Detail() {
    this.base = {};
    this.restUrl = 'http://news.ytoutiao.net/yfax-news-api/api/htt/';
    // this.reportUrl = 'http://182.92.82.188';
    this.reportUrl = 'http://and.ytoutiao.net';
    this.headerAdDom = null;
    this.footerAdDom = null;
    this.contentDom = null;
    this.insertAdDom = null;
    this.adArr = [
        // {
        //     type: 'yz',
        //     params: {
        //         url: '//cdn.ipadview.com/jssdk/combo.bundle.js',
        //         product: 20035,
        //         code: 'ytth5a2019040801xxl'
        //     },
        //     isExposure: false,
        //     isClick: false
        // },
        // {
        //     type: 'yz',
        //     params: {
        //         url: '//cdn.ipadview.com/jssdk/combo.bundle.js',
        //         product: 20035,
        //         code: 'ytth5a2019040802xxl'
        //     },
        //     isExposure: false,
        //     isClick: false
        // },
        {
            type: 'zm',
            params: {
                url: 'http://i.hao61.net/d.js?cid=30844'
            },
            isExposure: false,
            isClick: false
        },
        {
            type: 'xs',
            params: {
                url: '//www.smucdn.com/smu0/o.js',
                smua: 'd=m&s=b&u=u3736224&h=20:6'
            },
            isExposure: false,
            isClick: false
        },
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
        exposure: 10000027,
        click: 10000028
    };
    this.version = '1.0.0';
    this.privatetKey = 'PVf7vlR6qYZAB5gU';
    this.clientHeight = document.documentElement.clientHeight;

    Detail.prototype._init = function () {

        // location search 存储
        var search = window.location.search.split('?')[1];
        var tmp = {};
        search.split('&').forEach(function (item) {
            var kv = item.split('=');
            tmp[kv[0]] = kv[1];
        });
        this.base = tmp;

        // dom准备
        this.headerAdDom = document.getElementById('header-ad');
        this.footerAdDom = document.getElementById('footer-ad');
        this.contentDom = document.getElementById('content');


        // 加载详情
        this._loadDetailContent();

        // 加载广告
        // adArr 随机排序，取前3
        this.shuffle();
        // 头部
        this._loadAd(this.headerAdDom, this.adArr[0]);
        // 底部
        this._loadAd(this.footerAdDom, this.adArr[2]);

        // 监听初始化
        var that = this;
        this.headerAdDom.addEventListener('click', function () {
            that._clickReport({
                b1: that.adArr[0].type
            });
        });
        this.footerAdDom.addEventListener('click', function () {
            that._clickReport({
                b1: that.adArr[2].type
            });
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
            default:
                console.log('没有匹配的广告商家～');
                break;
        }

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

    Detail.prototype._loadDetailContent = function () {
        var that = this;
        var id = that.search2Obj().id;
        var params = {
            method: 'GET',
            url: this.restUrl + 'getDetailById?id=' + id,
            callback: function (res) {
                that.contentDom.innerHTML = res.content;

                // 确定文章中为AD位置
                var contentAdNode = that._getContentMountNode();
                // 混入
                that._loadAd(contentAdNode, that.adArr[1]);
                // 绑定dom
                that.insertAdDom = document.getElementById('insert-ad');
                // 绑定监听
                that.insertAdDom.addEventListener('click', function () {
                    that._clickReport({
                        b1: that.adArr[1].type
                    });
                });

                var imgArr = that.contentDom.querySelectorAll('p img');
                imgArr.forEach(item => {
                    item.setAttribute('src', item.dataset.src);
                    // item.setAttribute('width',item.dataset.size.split(',')[0]);
                    // item.setAttribute('height',item.dataset.size.split(',')[1]);
                    item.setAttribute('width', '100%');
                })
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
                    var data = JSON.parse(xhr.responseText).data;
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
        param.forEach(function (item) {
            var kv = item.split('=');
            paramsObj[kv[0]] = kv[1];
        });
        return paramsObj;
    }
}

; (function () {
    var detail = new Detail();
    detail._init();

    // 拿到当前最新的 clientHeight
    var curClientHeight = document.documentElement.clientHeight;
    // 头部广告直接曝光
    if (detail.headerAdDom.getBoundingClientRect().top <= curClientHeight && !detail.adArr[0].isExposure) {
        detail.adArr[0].isExposure = true;
        detail._exposureReport({
            b1: detail.adArr[0].type
        });
    }

    // 滚动监听
    var timer = null;
    window.addEventListener('scroll', function () {
        // 截流，50ms间隔
        if (typeof timer === 'number') {
            clearTimeout(timer);
        }
        timer = setTimeout(function () {

            var _clientHeight = document.documentElement.clientHeight;

            // header-ad
            if (detail.headerAdDom.getBoundingClientRect().top <= _clientHeight && !detail.adArr[0].isExposure) {
                detail.adArr[0].isExposure = true;
                detail._exposureReport({
                    b1: detail.adArr[0].type
                });
            }

            // insert-ad
            if (detail.insertAdDom.getBoundingClientRect().top <= _clientHeight && !detail.adArr[1].isExposure) {
                detail.adArr[1].isExposure = true;
                detail._exposureReport({
                    b1: detail.adArr[1].type
                });
            }
            console.log(detail.insertAdDom.getBoundingClientRect().top <= _clientHeight);
            console.log(detail.insertAdDom.getBoundingClientRect().top);
            console.log(_clientHeight);
            console.log('-------------------------');


            // footer-ad
            if (detail.footerAdDom.getBoundingClientRect().top <= _clientHeight && !detail.adArr[2].isExposure) {
                detail.adArr[2].isExposure = true;
                detail._exposureReport({
                    b1: detail.adArr[2].type
                });
            }
        }, 50);

    }, false);

    // webview 高度变化
    window.onresize = function () {
        detail.clientHeight = document.documentElement.clientHeight;
        console.log(detail.insertAdDom.getBoundingClientRect().top);
        console.log(detail.clientHeight);
        console.log('-------------------------');
    }
}())

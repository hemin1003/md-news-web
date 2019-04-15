function Detail() {
    this.restUrl = 'http://news.ytoutiao.net/yfax-news-api/api/htt/';
    this.reportUrl = 'http://182.92.82.188';
    this.headerAdDom = null;
    this.footerAdDom = null;
    this.contentDom = null;
    this.adArr = [
        {
            type: 'yz',
            params: {
                url: '//cdn.ipadview.com/jssdk/combo.bundle.js',
                product: 20035,
                code: 'ytth5a2019040801xxl'
            }
        },
        {
            type: 'zm',
            params: {
                url: 'http://i.hao61.net/d.js?cid=30843'
            }
        },
        {
            type: 'xs',
            params: {
                url: '//www.smucdn.com/smu0/o.js',
                smua: 'd=m&s=b&u=u3736224&h=20:6'
            }
        }
    ];
    var eventId = {
        exposure: 10000012,
        click: 10000013
    };

    Detail.prototype._init = function () {
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
                that._loadAd(contentAdNode, that.adArr[2]);

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
        xhr.send();
    }

    Detail.prototype._clickReport = function (params) {
        const formData = this._prepareData({ ...params, eventId: eventId.like_collect });
        return request(`${reportDomain}/yfax-htt-api/api/htt/doBurryPoint`, {
            method: 'POST',
            body: formData
        })
        this.request(params);
    }

    Detail.prototype._prepareData = function (params) {
        var sId = this._random(6);
        var preStr = `channel=ytt-coupon-h5&dotSource=ytt-coupon-h5&eventId=${params.eventId}&imei=${params.imei}&projectCode=${params.projectCode}&sId=${sId}&traceId=${params.tId}&version=${version}&secretKey=${privatetKey}`;
        var sign = md5.hash(preStr);

        var formData = new FormData();

        formData.append('projectCode', params.projectCode);
        formData.append('sId', sId);
        formData.append('eventId', params.eventId);
        formData.append('traceId', params.tId);
        formData.append('ip', '');
        formData.append('version', version);
        formData.append('channel', 'ytt-coupon-h5');
        formData.append('dotSource', 'ytt-coupon-h5');
        formData.append('jsonParam', "");
        formData.append('imei', params.imei);
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

var detail = new Detail();
detail._init();

window.onload = function () {
}
$(function() {
	function outSideFn() {
		this.hostname = "http://callnews.ytoutiao.net/yfax-news-api/api/htt/getLikeList"; // 站内
		this.outHostname = "http://callnews.ytoutiao.net/yfax-news-api/api/htt/getLikeList"; //站外
		this.adHostname = "http://callback.ytoutiao.net"; //   http://callback.ytoutiao.net  http://182.92.82.188:8084
		this.hostname2 = "http://wnews.ytoutiao.net";  // 站内
		this.outHostname2 = "http://onews.ytoutiao.net"; //站外
		this.page = 1;
		this.allList = [];
		this.fristTap = 0;
		this.baiDuTurn = 0; // 0 => 关  1=> 开  相关推荐
		this.wzSlideTurn = 0; // 微转滑动开关
		this.allAd = 0; // 文顶文末置顶广告开关
	}
	outSideFn.prototype = {
		// 初始化配置
		configFn:function() {
			var that = this;
			// 配置title
			$("title").text($(".article h1").text());
			$(".go_download span").text('现在干什么能赚钱');
			$(".go_download a").attr("target","_blank");
			// 2018.10.31新增奖励逻辑
			$(".more").click(function() {
				$(this).hide();
				$(".sub_shadow").hide();
				$(".wrap").css("height","auto");
			});
			// 判断站内还是站外
			if(that.getQueryString("froms") == "ytt") {
				// 站外
				if(that.allAd == 1) {
					that.ajaxAdFn();
				}
				// that.paramFn();
				$(".more").click(function() {
					// 滚动触发
					// $(window).scroll(function() {
					// 	if(that.wzSlideTurn == 0) {
					// 		if(($(".copyright").offset().top - $(window).scrollTop()) < 500) {
					// 			that.beforeRead();
					// 			that.wzSlideTurn = 1;
					// 		}
					// 	}
					// });
					setTimeout(function(){
						that.beforeRead();
					},5000);
				});
				if(that.allAd == 1) {
					// 判断是否是iframe
					if (parent === window) { 
						var o = document.getElementsByTagName("script");
						var c = o[o.length-1].parentNode;
						var ta = document.createElement('script'); ta.type = 'text/javascript'; ta.async = true;
						ta.src = '//yun.lvehaisen.com/h5-mami/msdk/tmk.js';
						ta.onload = function() {
							new TuiSDK({
							container: "#red_btn",
							appKey: '4YF8uBxeyH8AT6hcHgcxkKBYQAdP',
							slotId: '253930',
							local: "right: 0vw; top: 60%"
							});
						}
						var s = document.querySelector('head'); s.appendChild(ta);
					}
					that.tuiAFn(1,88); // 推啊展示上报 88站外 87站内
					// 推啊点击上报
					$(".fubiao-dialog").click(function() {
						tuiA(2,88);
					});
				}
				
			}else {
				if(that.allAd == 1) {
					// 站内
					that.InArticleAdReport = 1;
					if(that.randomFn(100)) {
						that.yntechAd($(".top_ads"),'<div id="_so_pdsBy_0"></div>');
						that.yntechAd($(".article_ad"),'<div id="_so_pdsBy_12"></div>');
					}else {
						that.baiduFn(".top_ads","//cdn.ipadview.com/jssdk/combo.bundle.js","20035","yuetth5a20181108xxl",0);
						that.baiduFn(".article_ad","//cdn.ipadview.com/jssdk/combo.bundle.js","20035","yuetth5a20181108xxl",0);
					}
					//判断是否有js广告
					setTimeout(function() {
						if($(".top_ads").find("iframe").length < 1) {
							that.InArticleAdReport = 0;
							that.ajaxAdFn();
						}
					},1000)
				}
			}
		},
		// 新闻内容
		contentFn:function() {
			var that = this;
			var IdUrl;
			var ids = that.getQueryString("id");
			var datas = {
				id: ids
			}
			if((that.getQueryString("froms") == "ytt") || (parent !== window)) {
				// 站外
				IdUrl = that.outHostname2;
				that.wxJump();
			}else {
				// 站内
				IdUrl = that.hostname2;
			}

			$.ajax({
				type: "get",
				url: IdUrl+"/yfax-news-api/api/htt/getDetailById",
				data: datas,
				async: true,
				success:function(res) {
					if(res.code == 200) {
						$(".article").html(res.data.content);
						// 处理 【点击这里】 的gif
						$(".go_download img").attr("src", $(".go_download img").data('src'));
						that.configFn();
						that.ajaxDomain();
						that.ajaxFn(1);
						// that.ajaxAdFn();
						that.LazyFn();
					}else {
						console.log(res);
						console.error(IdUrl+"请求出错！");
					}
				}
			});
		},
		// 2018.10.31新版参数
		paramFn:function() {
			var that = this;
			// console.log(that.getQueryString('rId'));
			// http://http://182.92.82.188:8084/yfax-htt-api/api/htt/queryShareReqParams
			var datas = {
				rId: that.getQueryString('rId')
			}
			$.ajax({
				type: "get",
				url: that.adHostname+"/yfax-htt-api/api/htt/queryShareReqParams",
				data: datas,
				success:function(res) {
					console.log(res);
					if(res.code == 200) {
						that.Param = res.data.queryParams;
						console.log(res.data.queryParams);
					}else {
						console.error(that.adHostname+"/yfax-htt-api/api/htt/queryShareReqParams请求出错！");
					}
				}
			});
		},
		Init:function() {
			var that = this;
			// this.ajaxDomain();
			// this.ajaxFn(1);
			// this.ajaxAdFn();
			this.contentFn();
			this.clickAdsFn();
			var startTime;
			var endTime;
			var adIndex = []; //已上报ad下标
			var badIndex = []; //百度js已上报下标
			// 计算滑动时间
			// that.fristTap = 0;
			$(window).on('touchstart',function(e) {
				startTime = new Date().getTime();
				console.log((startTime-endTime)/1000);
				
				// 调用微转
				// if(that.getQueryString('source') == "ytt_wz") {
				// 	if(that.fristTap == 0) {
				// 		that.beforeRead();
				// 		that.fristTap = 1;
				// 	}
				// }

				// 停留时间大于0.5s
				if((startTime-endTime)/1000 > 0.5) {
					// 判断文末广告是否展示
					console.log("106"+that.bottomAd);
					if(that.bottomAd == 1) {
						that.bottomAd = 0;
						var newData;
						if((that.getQueryString("froms") == "ytt") || (parent !== window)) {
							// 站外
							newData = {
								ua: '',
								device: '',
								dynamicParam: '',
								isOut: 1
							}
						}else {
							// 站内
							newData = {
								ua: that.getQueryString('ua'),
								device: that.getQueryString('device'),
								dynamicParam: that.getQueryString('dynamicParam'),
								isOut: 0
							}
						}
						$.get(that.adHostname+"/yfax-htt-api/api/htt/queryAdsOutside",newData,function(res) {
							console.log(res);
							if(res.code == 200) {
								for(var i = 0; i < res.data.length; i++) {
									if(res.data[i].outsidePosition == 6) {
										if((that.getQueryString("froms") == "ytt") || (parent !== window)) {
											// 站外  73 => 后台自接-站外-详情页-文末
											if(res.data[i].type == 89) {
												that.adRecordFn('',"",89,res.data[i].adsId,'',res.data[i].title,res.data[i].url,1);
											}else {
												that.adRecordFn('',"",73,res.data[i].adsId,'',res.data[i].title,res.data[i].url,1);
											}
										}else {
											// 站内 80 => 后台自接-站内-详情页-文末
											if(res.data[i].type == 86) {
												if(that.InArticleAdReport == 1) {
													that.adRecordFn(that.getQueryString("phoneNum"),that.getQueryString("adsSource"),86,res.data[i].adsId,decodeURI(that.getQueryString('tabName')),res.data[i].title,res.data[i].url,1,that.getQueryString("ip"),that.getQueryString("appVersion"),that.getQueryString("appChannel"),that.getQueryString("appImei"),that.getQueryString('ua'),that.getQueryString('device'),that.getQueryString('dynamicParam'));
												}
											}else {
												if(that.InArticleAdReport != 1) {
													that.adRecordFn(that.getQueryString("phoneNum"),that.getQueryString("adsSource"),80,res.data[i].adsId,decodeURI(that.getQueryString('tabName')),res.data[i].title,res.data[i].url,1,that.getQueryString("ip"),that.getQueryString("appVersion"),that.getQueryString("appChannel"),that.getQueryString("appImei"),that.getQueryString('ua'),that.getQueryString('device'),that.getQueryString('dynamicParam'));
												}
											}
										}
									}
								}
							}else {
								console.error(that.adHostname+"错误");
							}
						})
					}
					// 猜你喜欢-自家广告上报
					if(adArray.length > 0) {
						var indexs = adArray[adArray.length-1];
						if(adIndex.length > 0) {
							var Turn = adIndex.indexOf(indexs);  //判断adIndex数组中有没有indexs,没有则为-1
							if(Turn == -1) {
								adIndex.push(indexs);
								console.log(that.allList[indexs].id);
								// 展示上报
								if((that.getQueryString("froms") == "ytt") || (parent !== window)) {
									// 站外 72 => 后台自接-站外-详情页-推荐列表
									console.log('站外上报')
									that.adRecordFn('',"",72,that.allList[indexs].id,'',that.allList[indexs].title,that.allList[indexs].url,1);
								}else {
									// 站内 79 => 后台自接-站内-详情页-推荐列表
									console.log('站内上报');
									that.adRecordFn(that.getQueryString("phoneNum"),that.getQueryString("adsSource"),79,that.allList[indexs].id,decodeURI(that.getQueryString('tabName')),that.allList[indexs].title,that.allList[indexs].url,1,that.getQueryString("ip"),that.getQueryString("appVersion"),that.getQueryString("appChannel"),that.getQueryString("appImei"),that.getQueryString('ua'),that.getQueryString('device'),that.getQueryString('dynamicParam'));
								}
							}
						}else {
							adIndex.push(indexs);
							console.log(that);
							// 展示上报
							if((that.getQueryString("froms") == "ytt") || (parent !== window)) {
								// 站外
								that.adRecordFn('',"",72,that.allList[indexs].id,'',that.allList[indexs].title,that.allList[indexs].url,1);
							}else {
								// 站内
								that.adRecordFn(that.getQueryString("phoneNum"),that.getQueryString("adsSource"),79,that.allList[indexs].id,decodeURI(that.getQueryString('tabName')),that.allList[indexs].title,that.allList[indexs].url,1,that.getQueryString("ip"),that.getQueryString("appVersion"),that.getQueryString("appChannel"),that.getQueryString("appImei"),that.getQueryString('ua'),that.getQueryString('device'),that.getQueryString('dynamicParam'));
							}
						}
						console.log(adArray);
					}
					// 猜你喜欢-百度广告上报
					if(bdAdArray.length > 0) {
						var indexs = bdAdArray[bdAdArray.length-1];
						if(badIndex.length > 0) {
							var Turn = badIndex.indexOf(indexs);  //判断badIndex数组中有没有indexs,没有则为-1
							if(Turn == -1) {
								badIndex.push(indexs);
								console.log(that.allList[indexs].id);
								// 展示上报
								if((that.getQueryString("froms") == "ytt") || (parent !== window)) {
									// 站外 89 => 站外-Js广告
									console.log('站外百度上报')
									that.adRecordFn('',"",89,that.allList[indexs].id,'',that.allList[indexs].title,that.allList[indexs].url,1);
								}else {
									// 站内 86 => 站内-Js广告
									console.log('站内百度上报');
									that.adRecordFn(that.getQueryString("phoneNum"),that.getQueryString("adsSource"),86,that.allList[indexs].id,decodeURI(that.getQueryString('tabName')),that.allList[indexs].title,that.allList[indexs].url,1,that.getQueryString("ip"),that.getQueryString("appVersion"),that.getQueryString("appChannel"),that.getQueryString("appImei"),that.getQueryString('ua'),that.getQueryString('device'),that.getQueryString('dynamicParam'));
								}
							}
						}else {
							badIndex.push(indexs);
							console.log(that);
							// 展示上报
							if((that.getQueryString("froms") == "ytt") || (parent !== window)) {
								// 站外
								that.adRecordFn('',"",89,that.allList[indexs].id,'',that.allList[indexs].title,that.allList[indexs].url,1);
							}else {
								// 站内
								that.adRecordFn(that.getQueryString("phoneNum"),that.getQueryString("adsSource"),86,that.allList[indexs].id,decodeURI(that.getQueryString('tabName')),that.allList[indexs].title,that.allList[indexs].url,1,that.getQueryString("ip"),that.getQueryString("appVersion"),that.getQueryString("appChannel"),that.getQueryString("appImei"),that.getQueryString('ua'),that.getQueryString('device'),that.getQueryString('dynamicParam'));
							}
						}
						console.log(bdAdArray);
					}
				}
				console.log(badIndex);
			});

			$(window).on('touchend',function(e) {
				endTime = new Date().getTime();
				// console.log(new Date().getTime()-startTime);
			});

			var adArray = [];
			var bdAdArray = [];
			// 滚动事件
			$(window).scroll(function() {
				
				var doc_height = $(document).height(); //页面总高度
				var scroll_top = $(document).scrollTop(); //滚动高度
				var window_height = $(window).height(); //窗口高度

				//category => lafite_ad
				for(var i = 0;i < $(".category").length; i++) {
					if($(".category").eq(i).text() == "广告") {
						// console.log($(".category").eq(i).offset().top-scroll_top-window_height);
						if(($(".category").eq(i).offset().top-scroll_top <= window_height+50) && ($(".category").eq(i).offset().top-scroll_top > window_height)) {
							
							adArray.push(i);
							// console.log(that.ads[i].id);
						}
					}else if ($(".category").eq(i).text() == "百度广告") {
						if(($(".category").eq(i).offset().top-scroll_top <= window_height+50) && ($(".category").eq(i).offset().top-scroll_top > window_height)) {
							bdAdArray.push(i);
						}
					}
				}
				if(($(".article_ad").offset().top-scroll_top <= window_height-100) && ($(".article_ad").offset().top-scroll_top > window_height-200)) {
					that.bottomAd = 1;
				}else {
					// that.bottomAd = 0;
				}
				//滑动底部
				if(scroll_top + window_height >= doc_height) {
					// 有内容才处理
					if(that.L > 0) {
						that.page++
						// setTimeout(that.LazyFn,100); // 由于数据是api插入的，所以需要延迟加载
						that.ajaxFn(that.page);
					}else {
						$(".bottom_tips").text("我也是有底线的...").slideDown(100);
					}
				}

				// 判断站内还是站外
				if(that.getQueryString("froms") == "ytt") {
					// 站外
					if (parent === window) { 
						$(".footer").slideDown(500);
					}
					// $(".footer").slideDown(500);
				}else {
					// 站内
					$(".footer").hide();
					// that.outTurn = 1;  //outTurn  1=>站内  0=>站外
				}		
			});

			// setTimeout(this.LazyFn,200); // 由于数据是api插入的，所以需要延迟加载
		},
		// 获取参数fn
		getQueryString:function(name) {
			var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
			var r = window.location.search.substr(1).match(reg);
			if (r != null) {
				return unescape(r[2]);
			}
			return null;
		},
		baiduFn:function(dom,url,product,code,index) {
			var script = document.createElement("script");
			script.setAttribute("type","text/javascript");
			script.src = url;
			script.async = true;
			script.defer = "defer";
			script.dataset.product = product; //"20035"
			script.dataset.androidChannal = code; //"yuetth5a2018092602xxl"
			script.dataset.iosChannal = code; //"yuetth5a2018092602xxl"
			script.onload = script.onreadystatechange = function() {
				if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete" ) {
					console.log('88888888');
					// console.log($(".top_ads").height());
					script.onload = script.onreadystatechange = null;
				}else {
					console.log('6677999');
				}
			};
			// console.log(index);
			var s = document.querySelectorAll(dom)[index]; s.appendChild(script);
		},
		// 赢纳科技js合作
		yntechAd:function(dom,div) {
			$(dom).append(div); //<div id="_so_pdsBy_12"></div>  <div id="_so_pdsBy_0"></div>
			$.getScript("http://un.dnskuu.com/xay/11261.js?ydcp_id=11261&cumid=$mac_addr&apmac=$ap_mac");
		},
		// ad上报
		adRecordFn:function(phoneNum,adsSource,adsType,adsId,tabName,title,url,actionType,ip,appVersion,appChannel,appImei,ua,device,dynamicParam) {
			var adData = {
				phoneNum: phoneNum,
				adsSource: adsSource,
				adsType: adsType,
				adsId: adsId,
				tabName: tabName,
				title: title,
				url: url,
				actionType: actionType,
				ip: ip,
				appVersion: appVersion,
				appChannel: appChannel,
				appImei: appImei,
				ua: ua,
				device: device,
				dynamicParam: dynamicParam
			};
			$.post(this.adHostname+"/yfax-htt-api/api/htt/doBurryPointAdsHis",adData,function(result){
				console.log(result);
			});
		},
		// ad-list点击上报
		clickAdsFn:function() {
			var that = this;
			$(".guss_like ul").delegate(".lafite_ad","click",function(){
				var Cindex = $(this).index();
				console.log($(this));
				if((that.getQueryString("froms") == "ytt") || (parent !== window)) {
					// 站外  72 => 后台自接-站外-详情页-推荐列表
					that.adRecordFn('',"",72,that.allList[Cindex].id,'',that.allList[Cindex].title,that.allList[Cindex].url,2);
				}else {
					// 站内  79 => 后台自接-站内-详情页-推荐列表
					that.adRecordFn(that.getQueryString("phoneNum"),that.getQueryString("adsSource"),79,that.allList[Cindex].id,decodeURI(that.getQueryString('tabName')),that.allList[Cindex].title,that.allList[Cindex].url,2,that.getQueryString("ip"),that.getQueryString("appVersion"),that.getQueryString("appChannel"),that.getQueryString("appImei"),that.getQueryString('ua'),that.getQueryString('device'),that.getQueryString('dynamicParam')); 
				}
			});
		},
		// 推啊上报接口
		tuiAFn:function(types,num) {
			var that = this;
			$.ajax({
				type:"post",
				url: that.adHostname+"/yfax-htt-api/api/htt/doBurryPointAdsHis",
				// dataType:"jsonp",
				data: {
					adsType: num,
					adsId: "",
					url: "",
					actionType: types
				},
				success:function(res){
					console.log(res);
				}
			});
		},
		// 站外app下载链接url
		ajaxDomain:function() {
			var that = this;
			$.get(that.adHostname+"/yfax-htt-api/api/htt/queryAdsOutsideConfig",function(res) {
				if(res.code == 200) {
					$(".go_download a").attr("href",res.data.outSideAppDownloadUrl);
					that.Urls = res.data.outSideAppDownloadUrl;
				}else {
					console.error(that.adHostname+"请求出错！");
				}
			});
		},
		// 广告位接口
		ajaxAdFn:function() {
			var that = this;
			var newData;
			console.log(that.getQueryString("froms"));
			if((that.getQueryString("froms") == "ytt") || (parent !== window)) {
				// 站外
				newData = {
					ua: '',
					device: '',
					dynamicParam: '',
					isOut: 1
				}
			}else {
				// 站内
				newData = {
					ua: that.getQueryString('ua'),
					device: that.getQueryString('device'),
					dynamicParam: that.getQueryString('dynamicParam'),
					isOut: 0
				}
			}
			$.get(that.adHostname+"/yfax-htt-api/api/htt/queryAdsOutside",newData,function(res) {
				// console.log(res);
				if(res.code == 200) {
					console.log(res);
					for(var i = 0, L = res.data.length; i < L; i++) {
						var TypeData = res.data;
						// 抽离公共部分
						function selectType(dom,top,report,index,outSign,inSign) {
							var Class_top;
							if(top == 1) {
								Class_top = "lafite_top_ads";
							}else {
								Class_top = "";
							}
							switch(res.data[i].type){
								case 0:
									// 大图
									$(dom).html('<a class="lafite_news_ad '+Class_top+'" href="'+res.data[i].url+'" target="_blank"><div class="fixed_ads">广告</div><div class="lafite_BigPic"><div class="typeBig_title">'+res.data[i].title+'</div><img src="'+res.data[i].imageList[0]+'" alt="big"></div></a>')
								  break;
								case 1:
									// 单图
									$(dom).html('<a class="lafite_news_ad '+Class_top+'" href="'+res.data[i].url+'" target="_blank"><div class="fixed_ads">广告</div><div class="lafite_right"><div class="guss_font"><div class="guss_list_title">'+res.data[i].title+'</div></div><img class="right_pics" src="'+res.data[i].imageList[0]+'" alt="ads"></div></a>');
									break;
								case 2:
									// 三图
									$(dom).html('<a class="lafite_news_ad '+Class_top+'" href="'+res.data[i].url+'" target="_blank"><div class="fixed_ads">广告</div><div class="lafite_three_pic"><div class="typeMuch">'+res.data[i].title+'</div><div class="typeMuch_pic"><img src="'+res.data[i].imageList[0]+'" alt="list1"><img src="'+res.data[i].imageList[1]+'" alt="list2"><img src="'+res.data[i].imageList[2]+'" alt="list3"></div></div></a>');
									break;
								case 86:
									switch(dom) {
										case ".top_ads":
											if(that.randomFn(100)) {
												that.yntechAd($(".top_ads"),'<div id="_so_pdsBy_0"></div>');
											}else {
												that.baiduFn(dom,"//cdn.ipadview.com/jssdk/combo.bundle.js","20035","yuetth5a20181108xxl",0);
											}
											break;
										case ".title_ad":
											that.baiduFn(dom,"//cdn.ipadview.com/jssdk/combo.bundle.js","20035","",0);
											break;
										case ".article_ad":
											if(that.randomFn(100)) {
												that.yntechAd($(".article_ad"),'<div id="_so_pdsBy_12"></div>');
											}else {
												that.baiduFn(dom,"//cdn.ipadview.com/jssdk/combo.bundle.js","20035","yuetth5a20181108xxl",0);
											}
											break;	
									}
									break;
								case 89:
									switch(dom) {
										case ".top_ads":
											if(that.randomFn(100)) {
												that.yntechAd($(".top_ads"),'<div id="_so_pdsBy_0"></div>');
											}else {
												that.baiduFn(dom,"//cdn.ipadview.com/jssdk/combo.bundle.js","20035","yuetth5a20181108xxl",0);
											}
											break;
										case ".title_ad":
											that.baiduFn(dom,"//cdn.ipadview.com/jssdk/combo.bundle.js","20035","",0);
											break;
										case ".article_ad":
											if(that.randomFn(100)) {
												that.yntechAd($(".article_ad"),'<div id="_so_pdsBy_12"></div>');
											}else {
												that.baiduFn(dom,"//cdn.ipadview.com/jssdk/combo.bundle.js","20035","yuetth5a20181108xxl",0);
											}
											break;	
									}
									break;
							}
							if(report == 1) {
								if((that.getQueryString("froms") == "ytt") || (parent !== window)) {
									// 站外
									if(res.data[i].type == 89) {
										that.adRecordFn('',"",89,res.data[i].adsId,'',res.data[i].title,res.data[i].url,1);
									}else {
										that.adRecordFn('',"",outSign,res.data[i].adsId,'',res.data[i].title,res.data[i].url,1);
									}
								}else {
									// 站内
									if(res.data[i].type == 86) {
										that.adRecordFn(that.getQueryString("phoneNum"),that.getQueryString("adsSource"),86,res.data[i].adsId,decodeURI(that.getQueryString('tabName')),res.data[i].title,res.data[i].url,1,that.getQueryString("ip"),that.getQueryString("appVersion"),that.getQueryString("appChannel"),that.getQueryString("appImei"),that.getQueryString('ua'),that.getQueryString('device'),that.getQueryString('dynamicParam'));
									}else {
										that.adRecordFn(that.getQueryString("phoneNum"),that.getQueryString("adsSource"),inSign,res.data[i].adsId,decodeURI(that.getQueryString('tabName')),res.data[i].title,res.data[i].url,1,that.getQueryString("ip"),that.getQueryString("appVersion"),that.getQueryString("appChannel"),that.getQueryString("appImei"),that.getQueryString('ua'),that.getQueryString('device'),that.getQueryString('dynamicParam'));
									}
								}
							}
							$(dom).click(function() {
								if((that.getQueryString("froms") == "ytt") || (parent !== window)) {
									// 站外
									// 判断是否是百度js
									if(TypeData[$(this).index()].type == 89) {
										// 百度js上报
										that.adRecordFn('',"",89,res.data[index].adsId,'',res.data[index].title,res.data[index].url,2);
									}else {
										that.adRecordFn('',"",outSign,res.data[index].adsId,'',res.data[index].title,res.data[index].url,2);
									}
								}else {
									// 站内
									if(TypeData[$(this).index()].type == 86) {
										that.adRecordFn(that.getQueryString("phoneNum"),that.getQueryString("adsSource"),86,res.data[index].adsId,decodeURI(that.getQueryString('tabName')),res.data[index].title,res.data[index].url,2,that.getQueryString("ip"),that.getQueryString("appVersion"),that.getQueryString("appChannel"),that.getQueryString("appImei"),that.getQueryString('ua'),that.getQueryString('device'),that.getQueryString('dynamicParam'));
									}else {
										that.adRecordFn(that.getQueryString("phoneNum"),that.getQueryString("adsSource"),inSign,res.data[index].adsId,decodeURI(that.getQueryString('tabName')),res.data[index].title,res.data[index].url,2,that.getQueryString("ip"),that.getQueryString("appVersion"),that.getQueryString("appChannel"),that.getQueryString("appImei"),that.getQueryString('ua'),that.getQueryString('device'),that.getQueryString('dynamicParam'));
									}
									
								}
							})
						}
						switch(res.data[i].outsidePosition){
							case 1:
								// 置顶 78 => 后台自接-站外-详情页-置顶  85 => 后台自接-站内-详情页-置顶
								selectType(".top_ads",1,1,i,78,85);
							  break;
							case 5:
								// 文顶广告	74 = > 后台自接-站外-详情页-文顶  81 => 后台自接-站内-详情页-文顶 
								selectType(".title_ad","",1,i,74,81);
							  break;
							case 6:
								// 文末 73 => 后台自接-站外-详情页-文末  80 => 后台自接-站内-详情页-文末
								selectType(".article_ad","",0,i,73,80);
								  break;
						}
					}
					
				}else {
					console.error(that.adHostname+"请求出错！");
				}
			});
		},
		ajaxFn:function(page) {
			var UrlHostname;
			var that = this;
			var t = $(".article h1").text();
			var datas = {
				curPage: page,
				title: t
			};
			if((that.getQueryString("froms") == "ytt") || (parent !== window)) {
				// 站外
				UrlHostname = that.outHostname;
			}else {
				// 站内
				UrlHostname = that.hostname;
			}
				
			$.ajax({
				type:"get",
				url: UrlHostname,
				data: datas,
				beforeSend:function(XMLHttpRequest){ 
					$(".bottom_tips").text("加载中...").show();
				}, 
				success: function(res) {
					console.log(res);
					that.L = res.data.entityList.length;
					that.ads = res.data.entityList;
					
					// 没有新闻，则不插入广告
					if(res.data.count > 0) {
						// 调用广告接口
						var newDataList;
						if((that.getQueryString("froms") == "ytt") || (parent !== window)) {
							// 站外
							newDataList = {
								ua: '',
								device: '',
								dynamicParam: '',
								isOut: 1
							}
						}else {
							// 站内
							newDataList = {
								ua: that.getQueryString('ua'),
								device: that.getQueryString('device'),
								dynamicParam: that.getQueryString('dynamicParam'),
								isOut: 0
							}
						}
						$.get(that.adHostname+"/yfax-htt-api/api/htt/queryAdsOutsideCustom",newDataList,function(adres) {
							console.log(adres);
							// yuetth5a2018092602xxl
							var baiduAds = {
								type: "baidu",
								ids: "20035",
								code: "//cdn.ipadview.com/jssdk/combo.bundle.js",
							}
							// 处理无广告特殊情况
							if(adres.data != null) {
								var adsL;
								// 当广告数 > 新闻数 兼容处理
								if(that.L < adres.data.entityList.length) {
									adsL = that.L
								}else {
									adsL = adres.data.entityList.length
								}
								console.log(adsL);
								for(var j = 1,g = 0; j < 20; j=j+2,g++) {
									if(adres.data.entityList[g] == undefined) {
										// baiDuTurn => 1 开
										console.log(that.baiDuTurn);
										if(that.baiDuTurn == 1) {
											that.ads.splice(j,0,baiduAds);
										}
									}else {
										that.ads.splice(j,0,adres.data.entityList[g]);
									}
								}
							}else {
								for(var j = 1,g = 0; j < 20; j=j+2,g++) {
									// baiDuTurn => 1 开
									console.log(that.baiDuTurn);
									if(that.baiDuTurn == 1) {
										that.ads.splice(j,0,baiduAds);
									}
								}
							}
							
						if(that.ads.length > 0) {
							console.log(that.ads);
							that.allList.push.apply(that.allList,that.ads); //将列表合并
							for(var i = 0, L = that.ads.length; i < L; i++) {
								var isBaidu = that.ads[i].type;
								if(isBaidu == "baidu") {
									$(".guss_like ul").append('<a class="lafite_news lafite_ad"><div class="category" style="position: absolute;opacity: 0;">百度广告</div></a>');
									if(page > 1) {
										that.baiduFn(".lafite_news","//cdn.ipadview.com/jssdk/combo.bundle.js",that.ads[i].ids,that.ads[i].code,((page-1)*20+i));
									}else {
										that.baiduFn(".lafite_news","//cdn.ipadview.com/jssdk/combo.bundle.js",that.ads[i].ids,that.ads[i].code,i);
									}
								}else {
									var Title = that.ads[i].title,
									Url = that.ads[i].url,
									category = that.ads[i].category,
									Img = that.ads[i].imageList[0],
									Img2 = that.ads[i].imageList[1],
									Img3 = that.ads[i].imageList[2],
									Type = that.ads[i].type,
									Flag = that.ads[i].flag,
									u,
									aClass;
									// console.log(that.ads[i].id);
									if((that.getQueryString("froms") == "ytt") || (parent !== window)) {
										// 站外
										$(".go_download").show();
										// var hostDomin = window.location.href.split("articleUrl")[0];
										// var hostDomin = window.location.host;
										var hostDomin;
										if(Flag == 1) {
											aClass = "lafite_news"
											// if (parent !== window) { 
											// 	try {
											// 		hostDomin = parent.location.href; 
											// 	}catch (e) { 
											// 		hostDomin = document.referrer; 
											// 	} 
											//  }
											// console.log(hostDomin.split('/share')[0]);
											// 非广告
											u = "http://"+window.location.host+"/ytt/index.html?id="+Url.split('id=')[1]+"&froms=ytt";
										}else {
											// 广告
											aClass = "lafite_news lafite_ad"
											u = Url;
										}
									}else {
										// 站内
										if(Flag == 1) {
											aClass = "lafite_news";
											// &froms=ytt
											u = Url+"&phoneNum="+that.getQueryString("phoneNum")+"&ip="+that.getQueryString("ip")+"&appVersion="+that.getQueryString("appVersion")+"&appChannel="+that.getQueryString("appChannel")+"&appImei="+that.getQueryString("appImei")+"&tabName="+encodeURI(that.getQueryString('tabName'))+"&adsSource="+that.getQueryString("adsSource")+"&OutsideTitle="+Title+"&ua="+that.getQueryString("ua")+"&device="+that.getQueryString("device")+"&dynamicParam="+that.getQueryString("dynamicParam");
										}else {
											aClass = "lafite_news lafite_ad";
											u = Url;
										}
										// console.log(encodeURI(that.getQueryString('tabName')));
									}
									if(Type == undefined) {
										Type = 1;
									}
									switch(Type){
										case 0:
											// 大图
											$(".guss_like ul").append('<a class="'+aClass+'" href="'+u+'" target="_blank"><li class="typeBig"><div class="typeBig_title">'+Title+'</div><img src="'+Img+'" alt="big"><div class="typeBig_source category">'+category+'</div></li></a>');
										  break;
										case 1:
											// 单图
											$(".guss_like ul").append('<a class="'+aClass+'" href="'+u+'" target="_blank"><li class="typeRight"><div class="guss_font"><div class="guss_list_title">'+Title+'</div><div class="guss_list_source category">'+category+'</div></div><img src="'+Img+'" alt="ads"></li></a>');
										  break;
										case 2:
											// 三图
											$(".guss_like ul").append('<a class="'+aClass+'" href="'+u+'" target="_blank"><li class="typeMuch"><div class="typeMuch">'+Title+'</div><div class="typeMuch_pic"><img src="'+Img+'" alt="list1"><img src="'+Img2+'" alt="list2"><img src="'+Img3+'" alt="list3"></div><div class="typeMuch_source category">'+category+'</div></li></a>');
											break;
									}	                    		
								}
								
							}
						}
						});
					}
				 },
				 error:function(res) {
					 console.log('66666');
					 console.log(res);
				 }
			 });
		},
		// 站外微转
		beforeRead:function() {
			var that = this;
			
			if(that.getQueryString('source') == "ytt_wz") {
				console.log(that.Param);
				var sendData = {
					rId: that.getQueryString('rId')
				};
				$.ajax({
					type:"get",
					url: that.adHostname+"/yfax-htt-api/api/htt/doWxShareAward",
					data: sendData,
					success:function(res){
						console.log('微转奖励接口请求成功')
					},
					error:function(res) {
						console.error("doWxShareAward接口请求失败！");
						console.log(res);
					}
				});		
			}else {
				that.paramFn();
				if(that.Param != undefined) {
					$.ajax({
						type:"get",
						url: that.adHostname+"/yfax-htt-api/api/htt/doShareTaskAward?"+that.Param,
						// data: sendData,
						success:function(res){
							console.log('奖励接口请求成功')
						},
						error:function(res) {
							console.error("doShareTaskAward接口请求失败！");
							console.log(res);
						}
					});
				}else {
					console.error('that.Param错误');
				}
			}
		},
		// wx返回跳转
		wxJump:function() {
			// 微信分享跳转
	    	pushHistory();  
	        window.addEventListener("popstate", function(e) {  
	            //需要跳转的页面 
	            window.location.href = "https://cpu.baidu.com/1022/ff649564/i?pu=1&promotion_media_channel=ff649564";
	           }, false);  
	        function pushHistory() {  
	            var state = {  
	                title: "title",  
	                url: "#"  
	            };  
	            window.history.pushState(state, "title", "#");  
	        }
		},
		LazyFn:function() {
			// threshold: 100
			$("img").lazyload({ 
				  placeholder : "images/loading.gif",
				effect: "fadeIn",
				threshold: 300,
				data_attribute: "src",
			}); 
		},
		// 封装随机函数
		randomFn:function(num) {
			// num:概率
			var randomNum = Math.round(Math.random()*100);
			console.log(randomNum);
			console.log(num);
			if(randomNum < num) {
				return true
			}else {
				return false
			}
		},
		go:function() {
			this.Init();
		}
	}
	var start = new outSideFn().go();
});
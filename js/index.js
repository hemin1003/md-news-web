$(function() {
		function outSideFn() {
			this.hostname = "http://news.ytoutiao.net/yfax-news-api/api/htt/getLikeList";
			this.adHostname = "http://182.92.82.188:8084"; //http://182.92.82.188:8084
			this.hostname2 = "http://news.ytoutiao.net";
			this.page = 1;
			this.allList = [];
		}
		outSideFn.prototype = {
			// 新闻内容
			contentFn() {
				var that = this;
				var ids = that.getQueryString("id");
				var datas = {
					id: ids
				}
				$.ajax({
					type: "get",
					url: that.hostname2+"/yfax-news-api/api/htt/getDetailById",
					data: datas,
					beforeSend:function(XMLHttpRequest){ 
					// 　　$("html").html('<div class="cover">加载中</div>');
					}, 
					success:function(res) {
						if(res.code == 200) {
							$(".article").html(res.data.content);
							// 配置title
							$("title").text($(".article h1").text());
							$(".go_download span").text('现在干什么能赚钱');
							$(".more").click(function() {
								$(this).hide();
								$(".wrap").css("height","auto");
							});
							// 判断是否是iframe
							if (parent === window) { 
								var o = document.getElementsByTagName("script");
								var c = o[o.length-1].parentNode;
								var ta = document.createElement('script'); ta.type = 'text/javascript'; ta.async = true;
								ta.src = '//yun.lvehaisen.com/h5-mami/msdk/tmk.js';
								ta.onload = function() {
									new TuiSDK({
									container: "#red_btn",
									appKey: '2FeUYuki19ygFVQmQMUvpGYUyu9v',
									slotId: '197490',
									local: "right: 0vw; top: 60%"
									});
								}
								var s = document.querySelector('head'); s.appendChild(ta);
							}

							// 推啊点击上报
							$(".fubiao-dialog").click(function() {
								tuiA(2);
							});
							that.ajaxDomain();
							that.tuiAFn(1); // 推啊展示上报
							that.ajaxFn(1);
							that.ajaxAdFn();
							that.LazyFn();
						}else {
							console.error(that.hostname2+"请求出错！");
						}
					}
				});
			},
			Init() {
				var that = this;
				// this.ajaxDomain();
				// this.ajaxFn(1);
				// this.ajaxAdFn();
				this.contentFn();
				this.clickAdsFn();

				// setTimeout(function() {
				// 	// 配置go_download文件
				// 	that.ajaxFn(1);
				// 	that.ajaxAdFn();
					
				// 	$(".go_download span").text('现在干什么能赚钱');
				// },100);
				
				var startTime;
				var endTime;
				var adIndex = []; //已上报ad下标
				// 计算滑动时间
				$(window).on('touchstart',function(e) {
					startTime = new Date().getTime();
					console.log((startTime-endTime)/1000);

					// 停留时间大于0.5s
					if((startTime-endTime)/1000 > 0.5) {
						// 判断文末广告是否展示
						if(that.bottomAd == 1) {
							that.bottomAd = 0;
							var newData;
							if((that.getQueryString("from") == "ytt") || (parent !== window)) {
								// 站外
								newData = {
									ua: that.getQueryString('ua'),
									device: that.getQueryString('device'),
									dynamicParam: that.getQueryString('dynamicParam'),
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
								if(res.code == 200) {
									for(var i = 0; i < res.data.length; i++) {
										if(res.data[i].outsidePosition == 6) {
											if((that.getQueryString("from") == "ytt") || (parent !== window)) {
												// 站外
												that.adRecordFn('','',99,res.data[i].adsId,'',res.data[i].title,res.data[i].url,1);
											}else {
												// 站内
												that.adRecordFn(that.getQueryString("phoneNum"),that.getQueryString("adsSource"),4,res.data[i].adsId,decodeURI(that.getQueryString('tabName')),res.data[i].title,res.data[i].url,1,that.getQueryString("ip"),that.getQueryString("appVersion"),that.getQueryString("appChannel"),that.getQueryString("appImei"),that.getQueryString('ua'),that.getQueryString('device'),that.getQueryString('dynamicParam'));
											}
										}
									}
								}else {
									console.error(that.adHostname+"错误");
								}
							})
						}
						if(adArray.length > 0) {
							var indexs = adArray[adArray.length-1];
							if(adIndex.length > 0) {
								var Turn = adIndex.indexOf(indexs);  //判断adIndex数组中有没有indexs,没有则为-1
								if(Turn == -1) {
									adIndex.push(indexs);
									console.log(that.allList[indexs].id);
									// 展示上报
									if((that.getQueryString("from") == "ytt") || (parent !== window)) {
										// 站外
										console.log('站外上报')
										that.adRecordFn('','',99,that.allList[indexs].id,'',that.allList[indexs].title,that.allList[indexs].url,1);
									}else {
										// 站内
										console.log('站内上报');
										that.adRecordFn(that.getQueryString("phoneNum"),that.getQueryString("adsSource"),4,that.allList[indexs].id,decodeURI(that.getQueryString('tabName')),that.allList[indexs].title,that.allList[indexs].url,1,that.getQueryString("ip"),that.getQueryString("appVersion"),that.getQueryString("appChannel"),that.getQueryString("appImei"),that.getQueryString('ua'),that.getQueryString('device'),that.getQueryString('dynamicParam'));
									}
								}
							}else {
								adIndex.push(indexs);
								console.log(that);
								// 展示上报
								if((that.getQueryString("from") == "ytt") || (parent !== window)) {
									// 站外
									that.adRecordFn('','',99,that.allList[indexs].id,'',that.allList[indexs].title,that.allList[indexs].url,1);
								}else {
									// 站内
									that.adRecordFn(that.getQueryString("phoneNum"),that.getQueryString("adsSource"),4,that.allList[indexs].id,decodeURI(that.getQueryString('tabName')),that.allList[indexs].title,that.allList[indexs].url,1,that.getQueryString("ip"),that.getQueryString("appVersion"),that.getQueryString("appChannel"),that.getQueryString("appImei"),that.getQueryString('ua'),that.getQueryString('device'),that.getQueryString('dynamicParam'));
								}
							}
							console.log(adArray);
						}
					}
					console.log(adIndex);
				});

				$(window).on('touchend',function(e) {
					endTime = new Date().getTime();
					// console.log(new Date().getTime()-startTime);
				});

				var adArray = [];
				// 滚动事件
				$(window).scroll(function() {
					
					var doc_height = $(document).height(); //页面总高度
        			var scroll_top = $(document).scrollTop(); //滚动高度
					var window_height = $(window).height(); //窗口高度
					for(var i = 0;i < $(".category").length; i++) {
						if($(".category").eq(i).text() == "广告") {
							// console.log($(".category").eq(i).offset().top-scroll_top-window_height);
							if(($(".category").eq(i).offset().top-scroll_top <= window_height+50) && ($(".category").eq(i).offset().top-scroll_top > window_height)) {
								
								adArray.push(i);
								// console.log(that.ads[i].id);
							}
						}
					}
					if(($(".article_ad").offset().top-scroll_top <= window_height-100) && ($(".article_ad").offset().top-scroll_top > window_height-200)) {
						that.bottomAd = 1;
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
					if(that.getQueryString("from") == "ytt") {
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
			// ad上报
			adRecordFn(phoneNum,adsSource,adsType,adsId,tabName,title,url,actionType,ip,appVersion,appChannel,appImei,ua,device,dynamicParam) {
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
			clickAdsFn() {
				var that = this;
				$(".guss_like ul").delegate(".lafite_ad","click",function(){
					var Cindex = $(this).index();
					if((that.getQueryString("from") == "ytt") || (parent !== window)) {
						// 站外
						that.adRecordFn('','',99,that.allList[Cindex].id,'',that.allList[Cindex].title,that.allList[Cindex].url,2);
					}else {
						// 站内
						that.adRecordFn(that.getQueryString("phoneNum"),that.getQueryString("adsSource"),4,that.allList[Cindex].id,decodeURI(that.getQueryString('tabName')),that.allList[Cindex].title,that.allList[Cindex].url,2,that.getQueryString("ip"),that.getQueryString("appVersion"),that.getQueryString("appChannel"),that.getQueryString("appImei"),that.getQueryString('ua'),that.getQueryString('device'),that.getQueryString('dynamicParam')); 
					}
				});
			},
			// 推啊上报接口
			tuiAFn(types) {
				var that = this;
				$.ajax({
					type:"post",
					url: that.adHostname+"/yfax-htt-api/api/htt/doBurryPointAdsHis",
					// dataType:"jsonp",
					data: {
						adsType: 88,
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
			ajaxDomain() {
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
			ajaxAdFn() {
				var that = this;
				var newData;
				console.log(that.getQueryString("from"));
				if((that.getQueryString("from") == "ytt") || (parent !== window)) {
					// 站外
					newData = {
						ua: that.getQueryString('ua'),
						device: that.getQueryString('device'),
						dynamicParam: that.getQueryString('dynamicParam'),
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
							// 抽离公共部分
							function selectType(dom,top,report,index) {
								var Class_top;
								if(top == 1) {
									Class_top = "lafite_top_ads";
								}else {
									Class_top = "";
								}
								switch(res.data[i].type){
									case 0:
										// 大图
										dom.html('<a class="lafite_news_ad '+Class_top+'" href="'+res.data[i].url+'" target="_blank"><div class="fixed_ads">广告</div><div class="lafite_BigPic"><div class="typeBig_title">'+res.data[i].title+'</div><img src="'+res.data[i].imageList[0]+'" alt="big"></div></a>')
									  break;
									case 1:
										// 单图
										dom.html('<a class="lafite_news_ad '+Class_top+'" href="'+res.data[i].url+'" target="_blank"><div class="fixed_ads">广告</div><div class="lafite_right"><div class="guss_font"><div class="guss_list_title">'+res.data[i].title+'</div></div><img class="right_pics" src="'+res.data[i].imageList[0]+'" alt="ads"></div></a>');
										break;
									case 2:
										// 三图
										dom.html('<a class="lafite_news_ad '+Class_top+'" href="'+res.data[i].url+'" target="_blank"><div class="fixed_ads">广告</div><div class="lafite_three_pic"><div class="typeMuch_pic"><img src="'+res.data[i].imageList[0]+'" alt="list1"><img src="'+res.data[i].imageList[1]+'" alt="list2"><img src="'+res.data[i].imageList[2]+'" alt="list3"></div><div class="typeMuch">'+res.data[i].title+'</div></div></a>');
										break;
								}
								if(report == 1) {
									if((that.getQueryString("from") == "ytt") || (parent !== window)) {
										// 站外
										that.adRecordFn('','',99,res.data[i].adsId,'',res.data[i].title,res.data[i].url,1);
									}else {
										// 站内
										that.adRecordFn(that.getQueryString("phoneNum"),that.getQueryString("adsSource"),4,res.data[i].adsId,decodeURI(that.getQueryString('tabName')),res.data[i].title,res.data[i].url,1,that.getQueryString("ip"),that.getQueryString("appVersion"),that.getQueryString("appChannel"),that.getQueryString("appImei"),that.getQueryString('ua'),that.getQueryString('device'),that.getQueryString('dynamicParam'));
									}
								}
								dom.click(function() {
									if((that.getQueryString("from") == "ytt") || (parent !== window)) {
										// 站外
										that.adRecordFn('','',99,res.data[index].adsId,'',res.data[index].title,res.data[index].url,2);
									}else {
										// 站内
										that.adRecordFn(that.getQueryString("phoneNum"),that.getQueryString("adsSource"),4,res.data[index].adsId,decodeURI(that.getQueryString('tabName')),res.data[index].title,res.data[index].url,2,that.getQueryString("ip"),that.getQueryString("appVersion"),that.getQueryString("appChannel"),that.getQueryString("appImei"),that.getQueryString('ua'),that.getQueryString('device'),that.getQueryString('dynamicParam'));
									}
								})
							}
							switch(res.data[i].outsidePosition){
								case 1:
									// 置顶res.data[i].type top_ads
									selectType($(".top_ads"),1,1,i);
								  break;
								case 5:
									// 文顶广告	title_ad
									selectType($(".title_ad"),"",1,i);
								  break;
								case 6:
									// 文末res.data[i].type article_ad
									selectType($(".article_ad"),"",0,i);
							  		break;
							}
						}
						
					}else {
						console.error(that.adHostname+"请求出错！");
					}
				});
			},
			ajaxFn(page) {
				var that = this;
				var t = $(".article h1").text();
				var datas = {
					curPage: page,
					title: t
				};
				$.ajax({
                    type:"get",
					url: this.hostname,
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
							if((that.getQueryString("from") == "ytt") || (parent !== window)) {
								// 站外
								newDataList = {
									ua: that.getQueryString('ua'),
									device: that.getQueryString('device'),
									dynamicParam: that.getQueryString('dynamicParam'),
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
								// 处理无广告特殊情况
								if(adres.data != null) {
									var adsL;
									// 当广告数 > 新闻数 兼容处理
									if(that.L < adres.data.entityList.length) {
										adsL = that.L
									}else {
										adsL = adres.data.entityList.length
									}
									for(var j = 1,g = 0; j < adsL*2; j=j+2,g++) {
										that.ads.splice(j,0,adres.data.entityList[g]);
									}
								}
								
							if(that.ads.length > 0) {
								console.log(that.ads);
								that.allList.push.apply(that.allList,that.ads); //将列表合并
								for(var i = 0, L = that.ads.length; i < L; i++) {
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
										if((that.getQueryString("from") == "ytt") || (parent !== window)) {
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
												u = "http://"+window.location.host+"/ytt/index.html?id="+Url.split('id=')[1]+"&from=ytt";
											}else {
												// 广告
												aClass = "lafite_ad"
												u = Url;
											}
										}else {
											// 站内
											if(Flag == 1) {
												aClass = "lafite_news";
												// &from=ytt
												u = Url+"&phoneNum="+that.getQueryString("phoneNum")+"&ip="+that.getQueryString("ip")+"&appVersion="+that.getQueryString("appVersion")+"&appChannel="+that.getQueryString("appChannel")+"&appImei="+that.getQueryString("appImei")+"&tabName="+encodeURI(that.getQueryString('tabName'))+"&adsSource="+that.getQueryString("adsSource")+"&OutsideTitle="+Title;
											}else {
												aClass = "lafite_ad";
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
							});
						}
                     },
                     error:function(res) {
                     	console.log('66666');
                     	console.log(res);
                     }
                 });
			},
			LazyFn() {
				// threshold: 100
				$("img").lazyload({ 
		          	placeholder : "images/loading.gif",
		            effect: "fadeIn",
		            threshold: 300,
		            data_attribute: "src",
		        }); 
			},
			go() {
				this.Init();
			}
		}
		var start = new outSideFn().go();
	});
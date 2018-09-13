$(function() {
		function outSideFn() {
			this.hostname = "http://news.ytoutiao.net/yfax-news-api/api/htt/getLikeList";
			this.adHostname = "http://182.92.82.188:8084";
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
				$.get(that.hostname2+"/yfax-news-api/api/htt/getDetailById",datas,function(res) {
					// console.log(res.data.content);
					if(res.code == 200) {
						$(".article").html(res.data.content);
					}else {
						console.error(that.hostname2+"请求出错！");
					}
				});
			},
			Init() {
				var that = this;
				this.ajaxDomain();
				// this.ajaxFn(1);
				// this.ajaxAdFn();
				this.contentFn();
				this.clickAdsFn();

				setTimeout(function() {
					// 配置go_download文件
					that.ajaxFn(1);
					that.ajaxAdFn();
					
					$(".go_download span").text('现在干什么能赚钱');
				},100);

				// 配置title
				$("title").text($(".article h1").text());
				
				var startTime;
				var endTime;
				var adIndex = []; //已上报ad下标
				// 计算滑动时间
				$(window).on('touchstart',function(e) {
					startTime = new Date().getTime();
					console.log((startTime-endTime)/1000);

					// 停留时间大于1.5s
					if((startTime-endTime)/1000 > 0.5) {
						if(adArray.length > 0) {
							var indexs = adArray[adArray.length-1];
							if(adIndex.length > 0) {
								var Turn = adIndex.indexOf(indexs);  //判断adIndex数组中有没有indexs,没有则为-1
								if(Turn == -1) {
									adIndex.push(indexs);
									console.log(that.allList[indexs].id);
									// 展示上报
									if(that.getQueryString("from") == "ytt") {
										// 站内
										console.log('站内上报');
										that.adRecordFn(that.getQueryString("phoneNum"),that.getQueryString("adsSource"),4,that.allList[indexs].id,that.getQueryString("tabName"),that.allList[indexs].title,that.allList[indexs].url,1,that.getQueryString("ip"),that.getQueryString("appVersion"),that.getQueryString("appChannel"),that.getQueryString("appImei"));
									}else {
										// 站外
										console.log('站外上报')
										that.adRecordFn('','',99,that.allList[indexs].id,'',that.allList[indexs].title,that.allList[indexs].url,1);
									}
								}
							}else {
								adIndex.push(indexs);
								console.log(that);
								// 展示上报
								if(that.getQueryString("from") == "ytt") {
									// 站内
									// that.getQueryString("phoneNum")
									that.adRecordFn(that.getQueryString("phoneNum"),that.getQueryString("adsSource"),4,that.allList[indexs].id,that.getQueryString("tabName"),that.allList[indexs].title,that.allList[indexs].url,1,that.getQueryString("ip"),that.getQueryString("appVersion"),that.getQueryString("appChannel"),that.getQueryString("appImei"));
								}else {
									// 站外
									that.adRecordFn('','',99,that.allList[indexs].id,'',that.allList[indexs].title,that.allList[indexs].url,1);
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
					//滑动底部
        			if(scroll_top + window_height >= doc_height) {
        				// 有内容才处理
        				if(that.L > 0) {
        					that.page++
        					// setTimeout(that.LazyFn,100); // 由于数据是api插入的，所以需要延迟加载
        					that.ajaxFn(that.page);
        				}
        			}

        			// 判断站内还是站外
					if(that.getQueryString("from") == "ytt") {
						// 站内
						$(".footer").hide();
						// that.outTurn = 1;  //outTurn  1=>站内  0=>站外
					}else {
						// 站外
						$(".footer").slideDown(500);
						// that.outTurn = 0;
					}		
				});

				setTimeout(this.LazyFn,200); // 由于数据是api插入的，所以需要延迟加载
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
			adRecordFn(phoneNum,adsSource,adsType,adsId,tabName,title,url,actionType,ip,appVersion,appChannel,appImei) {
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
					appImei: appImei
				};
				$.post(this.adHostname+"/yfax-htt-api/api/htt/doBurryPointAdsHis",adData,function(result){
					console.log(result);
				});
			},
			// ad点击上报
			clickAdsFn() {
				var that = this;
				$(".guss_like ul").delegate(".lafite_ad","click",function(){
					var Cindex = $(this).index();
					if(that.getQueryString("from") == "ytt") {
						// 站内
						that.adRecordFn(that.getQueryString("phoneNum"),that.getQueryString("adsSource"),4,that.allList[Cindex].id,that.getQueryString("tabName"),that.allList[Cindex].title,that.allList[Cindex].url,2,that.getQueryString("ip"),that.getQueryString("appVersion"),that.getQueryString("appChannel"),that.getQueryString("appImei"));
					}else {
						// 站外
						that.adRecordFn('','',99,that.allList[Cindex].id,'',that.allList[Cindex].title,that.allList[Cindex].url,2);
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
				$.get(that.adHostname+"/yfax-htt-api/api/htt/queryAdsOutside",function(res) {
					// console.log(res);
					if(res.code == 200) {
						console.log(res);
						for(var i = 0, L = res.data.length; i < L; i++) {
							switch(res.data[i].outsidePosition){
								case 1:
									// 置顶
								  break;
								case 5:
									// 文顶广告
									$(".title_ad").html('<img src="'+res.data[i].imageList[0]+'"/>');
									$(".title_ad").parent().attr("href",res.data[i].url);
								  break;
								case 6:
									// 文末
									$(".article_ad").html('<img src="'+res.data[i].imageList[0]+'"/>');
									$(".article_ad").parent().attr("href",res.data[i].url);
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
                    success: function(res) {
                    	console.log(res);
                    	// console.log(that.Urls);
                    	that.L = res.data.entityList.length;
                    	that.ads = res.data.entityList;
                    	
                    	// 调用新闻
                    	$.get(that.adHostname+"/yfax-htt-api/api/htt/queryAdsOutsideCustom",function(adres) {
							console.log(adres);
							// console.log(adres.data.entityList.length);
                    		
                    		for(var j = 1,g = 0; j < adres.data.entityList.length*2; j=j+2,g++) {
								that.ads.splice(j,0,adres.data.entityList[g]);
                    		}
                    	// });
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
	                    			if(that.getQueryString("from") == "ytt") {
										// 站内
										if(Flag == 1) {
											aClass = "lafite_news"
										}else {
											aClass = "lafite_ad"
										}
	                    				u = Url+"&from=ytt&"+that.getQueryString("phoneNum")+"&"+that.getQueryString("ip")+"&"+that.getQueryString("appVersion")+"&"+that.getQueryString("appChannel")+"&"+that.getQueryString("appImei")+"&"+that.getQueryString("tabName")+"&"+that.getQueryString("adsSource");
	                    			}else {
										// 站外
										$(".go_download").show();
										// var hostDomin = window.location.href.split("articleUrl")[0];
										// var hostDomin = window.location.host;
										var hostDomin;
										if(Flag == 1) {
											aClass = "lafite_news"
											if (parent !== window) { 
												try {
													hostDomin = parent.location.href; 
												}catch (e) { 
													hostDomin = document.referrer; 
												} 
											 }
											// console.log(hostDomin.split('/share')[0]);
											// 非广告
											u = hostDomin.split('/share')[0]+"/share/newsShare/pre-share.html?articleUrl="+Url;
										}else {
											// 广告
											aClass = "lafite_ad"
											u = Url;
										}
	                    				
	                    			}
									if(Type == undefined) {
										Type = 1;
									}
									switch(Type){
										case 0:
											// 大图
											$(".guss_like ul").append('<a class="'+aClass+'" href="'+u+'"><li class="typeBig"><div class="typeBig_title">'+Title+'</div><img src="'+Img+'" alt="big"><div class="typeBig_source category">'+category+'</div></li></a>');
										  break;
										case 1:
											// 单图
											$(".guss_like ul").append('<a class="'+aClass+'" href="'+u+'"><li class="typeRight"><div class="guss_font"><div class="guss_list_title">'+Title+'</div><div class="guss_list_source category">'+category+'</div></div><img src="'+Img+'" alt="ads"></li></a>');
										  break;
										case 2:
											// 三图
											$(".guss_like ul").append('<a class="'+aClass+'" href="'+u+'"><li class="typeMuch"><div class="typeMuch">'+Title+'</div><div class="typeMuch_pic"><img src="'+Img+'" alt="list1"><img src="'+Img2+'" alt="list2"><img src="'+Img3+'" alt="list3"></div><div class="typeMuch_source category">'+category+'</div></li></a>');
											break;
									}	                    		
	                    	}
                    	}
                    	});
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
		            threshold: 150,
		            data_attribute: "src",
		        }); 
			},
			go() {
				this.Init();
			}
		}
		var start = new outSideFn().go();
	});
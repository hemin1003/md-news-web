$(function() {
		function outSideFn() {
			this.hostname = "http://news.ytoutiao.net/yfax-news-api/api/htt/getLikeList";
			this.adHostname = "http://182.92.82.188:8084";
			this.hostname2 = "http://news.ytoutiao.net";
			this.page = 1;
		}
		outSideFn.prototype = {
			contentFn() {
				var that = this;
				var ids = that.getQueryString("id");
				console.log(ids);
				var datas = {
					id: ids
				}
				$.get(that.hostname2+"/yfax-news-api/api/htt/getDetailById",datas,function(res) {
					console.log(res.data.content);
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
				this.ajaxFn(1);
				this.ajaxAdFn();
				this.contentFn();

				setTimeout(function() {
					// 配置go_download文件
					$(".go_download span").text('现在干什么能赚钱');
				},200);

				// 配置title
				$("title").text($(".article h1").text());
				
				var adArray = [];
				// 滚动事件
				$(window).scroll(function() {
					
					var doc_height = $(document).height(); //页面总高度
        			var scroll_top = $(document).scrollTop(); //滚动高度
					var window_height = $(window).height(); //窗口高度
					// var DomH = $(".category").eq(1).offset().top;
					// console.log($(".category").eq(1).text());
					for(var i = 0;i < $(".category").length; i++) {
						if($(".category").eq(i).text() == "广告") {
							// console.log($(".category").eq(i).offset().top-scroll_top-window_height);
							if(($(".category").eq(i).offset().top-scroll_top <= window_height-100) && ($(".category").eq(i).offset().top-scroll_top > window_height-120)) {
								
								console.log(i);
								adArray.push(i);
								// console.log(that.ads[i].id);
							}
						}
					}
					console.log(adArray);
					// if(DomH-scroll_top-window_height <= -100) {
					// 	console.log(DomH-scroll_top-window_height);
					// }

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

				setTimeout(this.LazyFn,100); // 由于数据是api插入的，所以需要延迟加载
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
                    	console.log(that.Urls);
                    	that.L = res.data.entityList.length;
                    	that.ads = res.data.entityList;
                    	
                    	// 调用新闻
                    	$.get(that.adHostname+"/yfax-htt-api/api/htt/queryAdsOutsideCustom",function(adres) {
							console.log(adres);
							console.log(adres.data.entityList.length);
                    		
                    		for(var j = 1,g = 0; j < adres.data.entityList.length*2; j=j+2,g++) {
								that.ads.splice(j,0,adres.data.entityList[g]);
                    		}
                    	// });
                    	if(that.ads.length > 0) {
							console.log(that.ads);
                    		for(var i = 0, L = that.ads.length; i < L; i++) {
	                    		var Title = that.ads[i].title,
	                    			Url = that.ads[i].url,
	                    			category = that.ads[i].category,
									Img = that.ads[i].imageList[0],
									Img2 = that.ads[i].imageList[1],
									Img3 = that.ads[i].imageList[2],
									Type = that.ads[i].type,
									Flag = that.ads[i].flag,
									u;
									// console.log(that.ads[i].id);
	                    			if(that.getQueryString("from") == "ytt") {
	                    				// 站内
	                    				u = Url+"?from=ytt";
	                    				$(".go_download").hide();
	                    			}else {
										// 站外
										var hostDomin = window.location.href.split("articleUrl")[0];
										if(Flag == 1) {
											// 非广告
											u = hostDomin+"?articleUrl="+Url;
										}else {
											// 广告
											u = Url;
										}
	                    				
	                    			}
									if(Type == undefined) {
										Type = 1;
									}
									switch(Type){
										case 0:
											// 大图
											$(".guss_like ul").append('<a href="'+u+'"><li class="typeBig"><div class="typeBig_title">'+Title+'</div><img src="'+Img+'" alt="big"><div class="typeBig_source category">'+category+'</div></li></a>');
										  break;
										case 1:
											// 单图
											$(".guss_like ul").append('<a href="'+u+'"><li class="typeRight"><div class="guss_font"><div class="guss_list_title">'+Title+'</div><div class="guss_list_source category">'+category+'</div></div><img src="'+Img+'" alt="ads"></li></a>');
										  break;
										case 2:
											// 三图
											$(".guss_like ul").append('<a href="'+u+'"><li class="typeMuch"><div class="typeMuch">'+Title+'</div><div class="typeMuch_pic"><img src="'+Img+'" alt="list1"><img src="'+Img2+'" alt="list2"><img src="'+Img3+'" alt="list3"></div><div class="typeMuch_source category">'+category+'</div></li></a>');
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
		            threshold: 100,
		            data_attribute: "src",
		        }); 
			},
			go() {
				this.Init();
			}
		}
		var start = new outSideFn().go();
	});
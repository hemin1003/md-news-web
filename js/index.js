$(function() {
		function outSideFn() {
			this.hostname = "http://news.ytoutiao.net/yfax-news-api/api/htt/getLikeList";
			this.adHostname = "http://182.92.82.188:8084";
			this.page = 1;
		}
		outSideFn.prototype = {
			Init() {
				var that = this;
				this.ajaxDomain();
				this.ajaxFn(1);
				this.ajaxAdFn();

				// 配置go_download文件
				$(".go_download span").text('现在干什么能赚钱');
				// 配置title
				$("title").text($(".article h1").text());

				// 滚动事件
				$(window).scroll(function() {
					var doc_height = $(document).height();
        			var scroll_top = $(document).scrollTop(); 
        			var window_height = $(window).height();
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
	                    			if(that.getQueryString("from") == "ytt") {
	                    				// 站内
	                    				u = Url+"?from=ytt";
	                    				$(".go_download").hide();
	                    			}else {
										// 站外
										if(Flag == 1) {
											u = that.Urls || "http://url.cn/5fEeGsL";
										}else {
											u = Url;
										}
	                    				
	                    			}
									if(Type == undefined) {
										Type = 1;
									}
									switch(Type){
										case 0:
											// 大图
											$(".guss_like ul").append('<a href="'+u+'"><li class="typeBig"><div class="typeBig_title">'+Title+'</div><img src="'+Img+'" alt="big"><div class="typeBig_source">'+category+'</div></li></a>');
										  break;
										case 1:
											// 单图
											$(".guss_like ul").append('<a href="'+u+'"><li class="typeRight"><div class="guss_font"><div class="guss_list_title">'+Title+'</div><div class="guss_list_source">'+category+'</div></div><img src="'+Img+'" alt="ads"></li></a>');
										  break;
										case 2:
											// 三图
											$(".guss_like ul").append('<a href="'+u+'"><li class="typeMuch"><div class="typeMuch">'+Title+'</div><img src="'+Img+'" alt="list1"><img src="'+Img2+'" alt="list2"><img src="'+Img3+'" alt="list3"><div class="typeMuch_source">'+category+'</div></li></a>');
											break;
									}
	                    		console.log(Type);
	                    		
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
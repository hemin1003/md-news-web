$(function() {
		function outSideFn() {
			this.hostname = "http://news.ytoutiao.net/yfax-news-api/api/htt/getLikeList";
			this.adHostname = "http://182.92.82.188:8084";
			this.Url;
			this.page = 1;
		}
		outSideFn.prototype = {
			Init() {
				var that = this;
				this.ajaxFn(1);
				this.ajaxDomain();
				this.ajaxAdFn();
				// 滚动事件
				$(window).scroll(function() {
					var doc_height = $(document).height();
        			var scroll_top = $(document).scrollTop(); 
        			var window_height = $(window).height();
        			if(scroll_top + window_height >= doc_height) {
        				that.page++
        				setTimeout(that.LazyFn,100); // 由于数据是api插入的，所以需要延迟加载
        				that.ajaxFn(that.page);
        			}
					$(".footer").slideDown(500);
				});
				setTimeout(this.LazyFn,100); // 由于数据是api插入的，所以需要延迟加载

				

			},
			// 站外app下载链接url
			ajaxDomain() {
				var that = this;
				$.get(that.adHostname+"/yfax-htt-api/api/htt/queryAdsOutsideConfig",function(res) {
					if(res.code == 200) {
						$(".go_download a").attr("href",res.data.outSideAppDownloadUrl);
						that.Url = res.data.outSideAppDownloadUrl;
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
								  // console.log(res.data[i].outsidePosition);
								  break;
								case 5:
									// 文顶广告
									$(".title_ad").html('<img data-src="'+res.data[i].imgUrlOutside+'"/>');
									$(".title_ad").parent().attr("href",res.data[i].url);
								  break;
								case 6:
									// 文末
									$(".article_ad").html('<img data-src="'+res.data[i].imgUrlOutside+'"/>');
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
					async: false,
                    success: function(res) {
                    	console.log(res);

                    	for(var i = 0, L = res.data.entityList.length; i < L; i++) {
                    		var Title = res.data.entityList[i].title,
                    			Url = res.data.entityList[i].url,
                    			category = res.data.entityList[i].category,
                    			Img = res.data.entityList[i].imageList[0];
                    		
                    		$(".guss_like ul").append('<a href="'+that.Url+'"><li><div class="guss_font"><div class="guss_list_title">'+Title+'</div><div class="guss_list_source">'+category+'</div></div><img data-src="'+Img+'" alt="ads"></li></a>');
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
		            data_attribute: "src",
		        }); 
			},
			go() {
				this.Init();
			}
		}
		var start = new outSideFn().go();
	});
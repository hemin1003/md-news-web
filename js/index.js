$(function() {
		function outSideFn() {
			this.hostname = "http://47.93.246.85:8090/yfax-news-api/api/htt/getMainList?domain=news_baby"
			this.adHostname = "http://182.92.82.188:8084/yfax-htt-api/api/htt/queryAdsOutsideConfig"
		}
		outSideFn.prototype = {
			Init() {
				this.LazyFn();
				this.ajaxFn();
				this.ajaxDomain();
			},
			ajaxDomain() {
				$.get(this.adHostname,function(res) {
					if(res.code == 200) {
						$(".go_download a").attr("href",res.data.outSideAppDownloadUrl);
					}else {
						console.error(this.adHostname+"请求出错！");
					}
				});
			},
			ajaxFn() {
				var that = this;
				var datas = {
					curPage: 1
				}
				$.ajax({
                    type:"get",
					url: this.hostname,
					data: datas,
					// dataType:"jsonp",
					// jsonp:"callback",
          			// jsonpCallback:"success_jsonpCallback",
					// async: true,
                    success: function(res) {
                    	console.log(res);

                    	for(var i = 0, L = res.data.entityList.length; i < L; i++) {
                    		var Title = res.data.entityList[i].title,
                    			Url = res.data.entityList[i].url,
                    			category = res.data.entityList[i].category,
                    			Img = res.data.entityList[i].imageList[0];

                    		$(".guss_title ul").after('<a href="'+Url+'"><li><div class="guss_font"><div class="guss_list_title">'+Title+'</div><div class="guss_list_source">'+category+'</div></div><img src="'+Img+'" alt="ads"></li></a>');
                    	}
                     },
                     error:function(res) {
                     	console.log('66666');
                     	console.log(res);
                     }
                 });
			},
			LazyFn() {
				$(".content img").lazyload({ 
		          	placeholder : "images/loading.gif",
		            effect: "fadeIn",
		            data_attribute: "src"
		        }); 
			},
			go() {
				this.Init();
			}
		}
		var start = new outSideFn().go();
	});
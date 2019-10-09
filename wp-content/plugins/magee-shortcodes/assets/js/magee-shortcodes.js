// counterUP
(function( $ ){
  "use strict";

  $.fn.counterUp = function( options ) {

    // Defaults
    var settings = $.extend({
        'time': 400,
        'delay': 10
    }, options);

    return this.each(function(){

        // Store the object
        var $this = $(this);
        var $settings = settings;

        var counterUpper = function() {
            var nums = [];
            var divisions = $settings.time / $settings.delay;
            var num = $this.text();
            var isComma = /[0-9]+,[0-9]+/.test(num);
            num = num.replace(/,/g, '');
            var isInt = /^[0-9]+$/.test(num);
            var isFloat = /^[0-9]+\.[0-9]+$/.test(num);
            var decimalPlaces = isFloat ? (num.split('.')[1] || []).length : 0;

            // Generate list of incremental numbers to display
            for (var i = divisions; i >= 1; i--) {

                // Preserve as int if input was int
                var newNum = parseInt(num / divisions * i);

                // Preserve float if input was float
                if (isFloat) {
                    newNum = parseFloat(num / divisions * i).toFixed(decimalPlaces);
                }

                // Preserve commas if input had commas
                if (isComma) {
                    while (/(\d+)(\d{3})/.test(newNum.toString())) {
                        newNum = newNum.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
                    }
                }

                nums.unshift(newNum);
            }

            $this.data('counterup-nums', nums);
            $this.text('0');

            // Updates the number until we're done
            var f = function() {
                $this.text($this.data('counterup-nums').shift());
                if ($this.data('counterup-nums').length) {
                    setTimeout($this.data('counterup-func'), $settings.delay);
                } else {
                    delete $this.data('counterup-nums');
                    $this.data('counterup-nums', null);
                    $this.data('counterup-func', null);
                }
            };
            $this.data('counterup-func', f);

            // Start the count up
            setTimeout($this.data('counterup-func'), $settings.delay);
        };

        // Perform counts when the element gets into view
        $this.waypoint(counterUpper, { offset: '100%', triggerOnce: true });
    });

  };

})( jQuery );

jQuery(document).ready(function($) {
								
            var s=$(".magee-feature-box.style2");
            for(i=0;i<s.length;i++) {
                var t=$(s[i]).find(".icon-box").outerWidth();
				if($(s[i]).find("img.feature-box-icon").length){
				var t=$(s[i]).find("img.feature-box-icon").outerWidth();
				}
                t+=15;
                t+="px";
                $(s[i]).css({"padding-left":t});
            }
            var s=$(".magee-feature-box.style2.reverse");
            for(i=0;i<s.length;i++) {
                var t=$(s[i]).find(".icon-box").outerWidth();
				if($(s[i]).find("img.feature-box-icon").length)
				var t=$(s[i]).find("img.feature-box-icon").outerWidth();
				
                t+=15;
                t+="px";
                $(s[i]).css({"padding-left":0,"padding-right":t});
            }
            var s=$(".magee-feature-box.style3");
            for(i=0;i<s.length;i++) {
                var t=$(s[i]).find(".icon-box").outerWidth();
				if($(s[i]).find("img.feature-box-icon").length)
				var t=$(s[i]).find("img.feature-box-icon").outerWidth();
                t+="px";
                $(s[i]).find("h3").css({"line-height":t});
            }
            var s=$(".magee-feature-box.style4");
            for(i=0;i<s.length;i++) {
                var t=$(s[i]).find(".icon-box").outerWidth();
				if($(s[i]).find("img.feature-box-icon").length)
				var t=$(s[i]).find("img.feature-box-icon").outerWidth();
                t=t/2;
                t1=-t;
                t+="px";
                t1+="px";
                $(s[i]).css({"padding-top":t,"margin-top":t});
                $(s[i]).find(".icon-box").css({"top":t1,"margin-left":t1});
				$(s[i]).find("img.feature-box-icon").css({"top":t1,"margin-left":t1});
            }
  
 //
 
  $(".wow").each(function(){
	var duration = $(this).data("animationduration");
       if( typeof duration !== "undefined"){
		   $(this).css({"-webkit-animation-duration":duration+"s","animation-duration":duration+"s"});
		   }
    });
  //
  
  
								 
								 
 function DY_scroll(wraper,prev,next,img,speed,or)
 { 
  var wraper = $(wraper);
  var prev = $(prev);
  var next = $(next);
  var img = $(img).find('ul');
  var w = img.find('li').outerWidth(true);
  var s = speed;
  
  next.click(function()
       {
        img.animate({'margin-left':-w},function()
                  {
                   img.find('li').eq(0).appendTo(img);
                   img.css({'margin-left':0});
                   });
        });
 
  prev.click(function()
       {
        img.find('li:last').prependTo(img);
        img.css({'margin-left':-w});
        img.animate({'margin-left':0});
        });
 
  if (or == true)
  {
   ad = setInterval(function() { next.click();},s*1000);
   wraper.hover(function(){clearInterval(ad);},function(){ad = setInterval(function() { next.click();},s*1000);});
  }
 
 }
 
 DY_scroll('.multi-carousel','.multi-carousel-nav-prev','.multi-carousel-nav-next','.multi-carousel-inner',3,false);
 
            $('[data-toggle="tooltip"]').tooltip();
            $('[data-toggle="popover"]').popover();
            $("[data-animation]").mouseover(function(){
                var anmiationName=$(this).attr("data-animation");
                $(this).addClass("animated").addClass(anmiationName);
            });
            $("[data-animation]").mouseout(function(){
                var anmiationName=$(this).attr("data-animation");
                $(this).removeClass("animated").removeClass(anmiationName);
            });
 
 ////flipbox
 
 $('.magee-flipbox-wrap').each(function(){
	var front_height = $(this).find('.flipbox-front').outerHeight();
	var back_height  = $(this).find('.flipbox-back').outerHeight();
	var height = front_height>back_height?front_height:back_height;
	 	$(this).css({'height':height});	
	var obj = 	$(this);
	obj.bind('touchstart',function(){
		switch ($(this).data('direction')){
			case 'horizontal': 
			$(this).find(".flipbox-front").addClass("horizontal-touchstart-front").removeClass("horizontal-touchend-front");
			$(this).find(".flipbox-back").addClass("horizontal-touchstart-back").removeClass("horizontal-touchend-back");
			break;
			case 'vertical':
			$(this).find(".flipbox-front").addClass("vertical-touchstart-front").removeClass("vertical-touchend-front");
			$(this).find(".flipbox-back").addClass("vertical-touchstart-back").removeClass("vertical-touchend-back");
			break;
			case 'slide-left':
			$(this).find(".flipbox-front").addClass("slide-left-touchstart-front").removeClass("slide-left-touchend-front");
			$(this).find(".flipbox-back").addClass("slide-left-touchstart-back").removeClass("slide-left-touchend-back");
			break;
			case 'slide-right':
			$(this).find(".flipbox-front").addClass("slide-right-touchstart-front").removeClass("slide-right-touchend-front");
			$(this).find(".flipbox-back").addClass("slide-right-touchstart-back").removeClass("slide-right-touchend-back");
			break;
			case 'slide-top':
			$(this).find(".flipbox-front").addClass("slide-top-touchstart-front").removeClass("slide-top-touchend-front");
			$(this).find(".flipbox-back").addClass("slide-top-touchstart-back").removeClass("slide-top-touchend-back");
			break;
			case 'slide-bottom':
			$(this).find(".flipbox-front").addClass("slide-bottom-touchstart-front").removeClass("slide-bottom-touchend-front");
			$(this).find(".flipbox-back").addClass("slide-bottom-touchstart-back").removeClass("slide-bottom-touchend-back");
			break;
			case 'flip-bottom':
			$(this).find(".flipbox-back").addClass("flip-bottom-touchstart-back").removeClass("flip-bottom-touchend-back");
			break;
			case 'flip-top':
			$(this).find(".flipbox-back").addClass("flip-top-touchstart-back").removeClass("flip-top-touchend-back");
			break;
			case 'flip-right':
			$(this).find(".flipbox-back").addClass("flip-right-touchstart-back").removeClass("flip-right-touchend-back");
			break;
			case 'flip-left':
			$(this).find(".flipbox-back").addClass("flip-left-touchstart-back").removeClass("flip-left-touchend-back");
			break;
			}	
		});
	
	obj.bind('touchend',function(){
		switch ($(this).data('direction')){
			case 'horizontal': 
			$(this).find(".flipbox-front").addClass("horizontal-touchend-front").removeClass("horizontal-touchstart-front");
			$(this).find(".flipbox-back").addClass("horizontal-touchend-back").removeClass("horizontal-touchstart-back");
			break;
			case 'vertical': 
			$(this).find(".flipbox-front").addClass("vertical-touchend-front").removeClass("vertical-touchstart-front");
			$(this).find(".flipbox-back").addClass("vertical-touchend-back").removeClass("vertical-touchstart-back");
			break;
			case 'slide-left':
			$(this).find(".flipbox-front").removeClass("slide-left-touchstart-front").addClass("slide-left-touchend-front");
			$(this).find(".flipbox-back").removeClass("slide-left-touchstart-back").addClass("slide-left-touchend-back");
			break;
			case 'slide-right':
			$(this).find(".flipbox-front").removeClass("slide-right-touchstart-front").addClass("slide-right-touchend-front");
			$(this).find(".flipbox-back").removeClass("slide-right-touchstart-back").addClass("slide-right-touchend-back");
			break;
			case 'slide-top':
			$(this).find(".flipbox-front").removeClass("slide-top-touchstart-front").addClass("slide-top-touchend-front");
			$(this).find(".flipbox-back").removeClass("slide-top-touchstart-back").addClass("slide-top-touchend-back");
			break;
			case 'slide-bottom':
			$(this).find(".flipbox-front").removeClass("slide-bottom-touchstart-front").addClass("slide-bottom-touchend-front");
			$(this).find(".flipbox-back").removeClass("slide-bottom-touchstart-back").addClass("slide-bottom-touchend-back");
			break;
			case 'flip-bottom':
			$(this).find(".flipbox-back").removeClass("flip-bottom-touchstart-back").addClass("flip-bottom-touchend-back");
			break;
			case 'flip-top':
			$(this).find(".flipbox-back").removeClass("flip-top-touchstart-back").addClass("flip-top-touchend-back");
			break;
			case 'flip-right':
			$(this).find(".flipbox-back").removeClass("flip-right-touchstart-back").addClass("flip-right-touchend-back");
			break;
			case 'flip-left':
			$(this).find(".flipbox-back").removeClass("flip-left-touchstart-back").addClass("flip-left-touchend-back");
			break;
			}	
		});	
 });
 
 // counter up
 
  $('.magee-counter-box .counter-num').counterUp({
            delay: 10,
            time: 1000
        });
  
  /* ------------------------------------------------------------------------ */
/*  animation													*/
/* ------------------------------------------------------------------------ */
										  
    $('.magee-animated').each(function(){
			 if($(this).data('imageanimation')==="yes"){
		         $(this).find("img,i.fa").css("visibility","hidden");	
		 }
		 else{
	           $(this).css("visibility","hidden");	
		 }		
		 
	 });
	
	if(jQuery().waypoint) {
		$('.magee-animated').waypoint(function() {
											  
			$(this).css({'visibility':'visible'});
			$(this).find("img,i.fa").css({'visibility':'visible'});	


			// this code is executed for each appeared element
			var animation_type       = $(this).data('animationtype');
			var animation_duration   = $(this).data('animationduration');
	        var image_animation      = $(this).data('imageanimation');
			 if(image_animation === "yes"){
						 
			$(this).find("img,i.fa").addClass("animated "+animation_type);

			if(animation_duration) {
				$(this).find("img,i.fa").css('-moz-animation-duration', animation_duration+'s');
				$(this).find("img,i.fa").css('-webkit-animation-duration', animation_duration+'s');
				$(this).find("img,i.fa").css('-ms-animation-duration', animation_duration+'s');
				$(this).find("img,i.fa").css('-o-animation-duration', animation_duration+'s');
				$(this).find("img,i.fa").css('animation-duration', animation_duration+'s');
			}
			
				 
			 }else{
			$(this).addClass("animated "+animation_type);

			if(animation_duration) {
				$(this).css('-moz-animation-duration', animation_duration+'s');
				$(this).css('-webkit-animation-duration', animation_duration+'s');
				$(this).css('-ms-animation-duration', animation_duration+'s');
				$(this).css('-o-animation-duration', animation_duration+'s');
				$(this).css('animation-duration', animation_duration+'s');
			}
			 }

			 
		},{ triggerOnce: true, offset: '90%' });
	}
  $("a[rel^='prettyPhoto']").prettyPhoto();
  
 //accordion icon controls 
  jQuery(".panel-title").each(function(){
			var open_icon =jQuery(this).find("i").attr("data-open");
			var close_icon = jQuery(this).find("i").attr("data-close");
			var now_class = jQuery(this).find("i").attr("class");
			jQuery(this).click(function(){	
			  if(jQuery(this).find("i").attr("data-open")  && jQuery(this).find("i").attr("data-close") ){							
			  if(jQuery(this).find("i").hasClass("open-magee-accordion")){ 
				  var new_class = now_class.replace('open-magee-accordion','close-magee-accordion').replace(open_icon,close_icon);
				  jQuery(this).find("i").attr("class",new_class);
				  }else{
				  var new_class = now_class.replace('close-magee-accordion','open-magee-accordion').replace(close_icon,open_icon);
				  jQuery(this).find("i").attr("class",new_class);
				  jQuery(this).parents(".panel-default").siblings().each(function(){
					  var sub_icon1 =  jQuery(this).find(".panel-title i").attr("data-open");
					  var sub_icon2 =  jQuery(this).find(".panel-title i").attr("data-close");
					  var sub_class = jQuery(this).find(".panel-title i").attr("class");
					  if( sub_icon1 && sub_icon2 && sub_class ){
					  var new_sub_class = sub_class.replace('open-magee-accordion','close-magee-accordion').replace(sub_icon1,sub_icon2);
					  jQuery(this).find(".panel-title i").attr("class",new_sub_class);															 
					  }
				  });
				  }		
			  }else{
				 jQuery(this).parents(".panel-default").siblings().each(function(){
					  var sub_icon1 =  jQuery(this).find(".panel-title i").attr("data-open");
					  var sub_icon2 =  jQuery(this).find(".panel-title i").attr("data-close");
					  var sub_class = jQuery(this).find(".panel-title i").attr("class");
					  if( sub_icon1  && sub_icon2  && sub_class ){
					  var new_sub_class = sub_class.replace('open-magee-accordion','close-magee-accordion').replace(sub_icon1,sub_icon2);
					  jQuery(this).find(".panel-title i").attr("class",new_sub_class);															 
					  }
				  });
				  }
			  });	 
  });
  
  //audio
 jQuery('.ms-audio').each(function(){
	jQuery(this).audioPlayer({
						classPrefix: 'audioplayer',
						strPlay: 'Play',
						strPause: 'Pause',
						strVolume: 'Volume',
						strControls : jQuery(this).data('controls'),
						strStyle : jQuery(this).data('style'),
					});							
								
								
	});
  //countdowns
  jQuery('.magee-countdown-circle-type').each(function() {
	  obj =jQuery(this);
      
	  obj.ClassyCountdown({
                                                end: obj.data('endtime'),
												now: obj.data('nowtime'),
                                                labels: true,
												labelsOptions: {
                                                    lang: {
                                                        days: obj.data('day_field_text'),
                                                        hours: obj.data('hours_field_text'),
                                                        minutes: obj.data('minutes_field_text'),
                                                        seconds: obj.data('seconds_field_text')
                                                    },
                                                },
                                                style: {
                                                    element: '',
                                                    textResponsive: .5,
                                                    days: {
                                                        gauge: {
                                                            thickness: .03,
                                                            bgColor: "rgba(255,255,255,0.05)",
                                                            fgColor: obj.data('circle_type_day_color')
                                                        },
                                                        textCSS: 'font-family:'+obj.data('google_fonts')+';font-weight:300; color:'+obj.data('fontcolor')+';'
                                                    },
                                                    hours: {
                                                        gauge: {
                                                            thickness: .03,
                                                            bgColor: "rgba(255,255,255,0.05)",
                                                            fgColor: obj.data('circle_type_hours_color')
                                                        },
                                                        textCSS: 'font-family:'+obj.data('google_fonts')+';font-weight:300; color:'+obj.data('fontcolor')+';'
                                                    },
                                                    minutes: {
                                                        gauge: {
                                                            thickness: .03,
                                                            bgColor: "rgba(255,255,255,0.05)",
                                                            fgColor: obj.data('circle_type_minutes_color')
                                                        },
                                                        textCSS: 'font-family:'+obj.data('google_fonts')+';font-weight:300; color:'+obj.data('fontcolor')+';'
                                                    },
                                                    seconds: {
                                                        gauge: {
                                                            thickness: .03,
                                                            bgColor: "rgba(255,255,255,0.05)",
                                                            fgColor: obj.data('circle_type_seconds_color')
                                                        },
                                                        textCSS: 'font-family:'+obj.data('google_fonts')+';font-weight:300; color:'+obj.data('fontcolor')+';'
                                                    }

                                                },
                                                onEndCallback: function() {
                                                    obj.remove();
                                                }
                                            });
    
  });
  //dailymotion
  jQuery('.magee-dailymotion').each(function(){
	dail = jQuery(this);
	if( dail.data("width") == '100%' || dail.data("width") == '' &&  dail.data("height") == '100%' || dail.data("height") == ''){
	width = dail.width();
	iframewidth = dail.find("iframe").eq(0).width();
	iframeheight = dail.find("iframe").eq(0).height();
	op = iframeheight/iframewidth;
	dail.find("iframe").eq(0).width(width-100);
	dail.find("iframe").eq(0).height(op*(width-100));		
	}
  });
  
  //document
  jQuery('.magee-document').each(function(){
    doc =  jQuery(this);
	if(doc.data("responsive") == 'yes'){
		width = doc.width();
		if(width < doc.data("width")){
		op = doc.data("height")/doc.data("width");
		doc.find("iframe").eq(0).width(width);
		doc.find("iframe").eq(0).height(op*width);
		} 			
	}
  });
  
  //expand
  jQuery('.magee-expand').each(function(){
	expand = jQuery(this);
	less_icon = expand.data("less-icon");
	less_icon_color = expand.data("less-icon-color");
	more_icon = expand.data("more-icon");
	more_icon_color = expand.data("more-icon-color");
	if(less_icon.indexOf("fa-")>=0){
	var more = '<i class="fa '+less_icon+'" style="color:'+less_icon_color+';"></i> '+ expand.data('less-text');
	}else{
	var more = '<img src="'+less_icon+'" class="image-instead"/>'+ expand.data('less-text');
	}
	if(more_icon.indexOf("fa-")>=0){
	var less = '<i class="fa '+ more_icon +'" style="color:'+more_icon_color+';"></i> '+ expand.data('more-text');
	}else{
	var less = '<img src="'+ more_icon +'" class="image-instead"/>'+ expand.data('more-text');
	}
	expand.find(".expand-control").toggle(
	function(){	      				  
		jQuery(this).html(more);
	},
	function(){	      				  
		jQuery(this).html(less);
	}
    );
	expand.find(".expand-control").click(function(){
	  jQuery(this).parent(".magee-expand").find(".expand-content").slideToggle(500);
	});    										 
											 
  });
  
  //heading
  jQuery(".magee-heading").each(function(){
	magee_heading = jQuery(this);	
	if(magee_heading.data("responsive") == 'yes'){
		if(jQuery(window).width() <1200){	
			newPercentage = ((jQuery(window).width() / 1200) * 100) + "%";
			jQuery(this).find(".heading-inner").css({"font-size": newPercentage});
		}	
	}
  });
  
  //image compare
  jQuery(".magee-image-compare").each(function(){
	jQuery(this).twentytwenty(
	{default_offset_pct: jQuery(this).data("pct"),
	orientation: jQuery(this).data("orientation")
	});
  });
  //modal
  var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9+/=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/rn/g,"n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}
  jQuery(".magee-modal-trigger").each(function() {
	obj = jQuery(this);
	obj.mgmodal({
			title: obj.data('title'),
			message	: Base64.decode(obj.data('content')),
			close_icon:obj.data('close_icon'),
			type:obj.data('effect'),
			id:obj.data('id')
		}); 
  }); 
  //piechart
  jQuery(".magee-chart-box").each(function(){
  piechart = jQuery(this);
							piechart.easyPieChart({
								barColor: piechart.data("barcolor"),
								trackColor: piechart.data("trackcolor"),
								scaleColor: false,
								lineWidth: 10,
								trackWidth: 10,
								size: piechart.data("size"),
								lineCap: piechart.data("linecap")
							  }); 
  
  });
  
  //vimeo
  jQuery(".vimeo-video").each(function(){
  magee_vimeo = jQuery(this);
	if( magee_vimeo.data("width") == '100%' || magee_vimeo.data("height") == '100%' && magee_vimeo.data("width") == '' || magee_vimeo.data("height") == ''){
									divwidth = magee_vimeo.width();
									width = magee_vimeo.find("iframe.magee-vimeo").width();
									height = magee_vimeo.find("iframe.magee-vimeo").height();
									op = height/width;
									magee_vimeo.find("iframe.magee-vimeo").width(divwidth-100);
									magee_vimeo.find("iframe.magee-vimeo").height(op*divwidth-100);
									}
	
  });
  
 });

jQuery(window).load(function($) {
  ////flipbox
 
 jQuery('.magee-flipbox-wrap').each(function(){
	var front_height = jQuery(this).find('.flipbox-front').outerHeight();
	var back_height = jQuery(this).find('.flipbox-back').outerHeight();
	var height = front_height>back_height?front_height:back_height;
	
	 	jQuery(this).css({'height':height});	
 });					   
							   
 });

//heading responsive
jQuery(window).on("resize", function (){
	//heading
  jQuery(".magee-heading").each(function(){
	magee_heading = jQuery(this);	
	if(magee_heading.data("responsive") == 'yes'){
		if(jQuery(window).width() <1200){
		newPercentage = ((jQuery(window).width() / 1200) * 100) + "%";
		jQuery(this).find(".heading-inner").css({"font-size": newPercentage});
		}else{
		jQuery(this).find(".heading-inner").css({"font-size": magee_heading.data("fontsize")});
		}
		
	}	
   });  
  });						   

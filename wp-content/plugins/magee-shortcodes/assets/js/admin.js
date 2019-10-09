jQuery(document).ready(function($){

$('.magee_shortcodes,.magee_shortcodes_textarea').click(function(){
  var popup = 'shortcode-generator';

        if(typeof params != 'undefined' && params.identifier) {
            popup = params.identifier;
        }
		
        var magee = "Magee Shortcodes<span class='shortcode_show_name'></span><a class='link-doc' target='_blank' href='https://www.mageewp.com/magee-shortcode-guide.html'>Document</a><a class='link-forum' target='_blank' href='https://www.mageewp.com/forums/magee-shortcode/'>Forums</a><a class='link-pro' target='_blank' href='https://www.mageewp.com/magee-shortcode.html'>Pro Version</a>";
        // load thickbox
	    var height = $(window).height()-150;
        tb_show(magee, ajaxurl + "?action=magee_shortcodes_popup&popup=" + popup + "&width=800&height="+height);
       // $('#TB_window').hide();
	   
  })




$('.magee_shortcodes_textarea').on("click",function(){
			var id = $(this).next().find("textarea").attr("id");
			$('#magee-shortcode-textarea').val(id);
		});																	   

$(document).on("click",'a.magee_shortcode_item',function(){
  								  
  var obj       = $(this);
  var shortcode = obj.data("shortcode");
  var form      = obj.parents("div#magee_shortcodes_container form");
 
   $.ajax({
		type: "POST",
		url: ajaxurl,
		dataType: "html",
		data: { shortcode: shortcode, action: "magee_shortcode_form" },
		success:function(data){
		   form.find(".magee_shortcodes_list").hide();
		   form.find("#magee-shortcodes-settings").show();
		   form.find("#magee-shortcodes-settings .current_shortcode").text(shortcode);
		   form.find("#magee-shortcodes-settings #magee-shortcode").val(shortcode);
		   form.find("#magee-shortcodes-settings-inner").html(data);
		   //ADD clone source
		   $(".magee-shortcodes-settings-inner-clone").html(form.find(".column-shortcode-inner").html());
		   var myOptions = {
		   change: function(event, ui){
			   $('#magee_shortcodes_container .wp-color-picker-field').each(function(){	
					var color = $(this).parents('.wp-picker-container').find('.wp-color-result').css("background-color")						 
					$(this).css("background-color",color);
					var  top = parseInt($(this).parents('.wp-picker-container').find('a.iris-square-value').css("top").replace('px',''));
					var percent = parseInt($(this).parents('.wp-picker-container').find('div.iris-slider-offset span').css("bottom"));
					if(top < 87 && percent < 97){
						$(this).css("color","black");
						}else{
							$(this).css("color","white");
							}
			   });
			   },
			};

		   $('#magee_shortcodes_container .wp-color-picker-field').wpColorPicker(myOptions);	
		   $.ajax({
			  type: "POST",
			  url: ajaxurl,
			  dataType: "html",
			  data: {action:'magee_control_button'},
			  success:function(data){ $('#TB_window').append(data);
			  var content_height = $('#TB_window').outerHeight();
              var title_height = $('#TB_title').outerHeight();
			  var footer_height = $('#TB_footer').outerHeight();
	          $('#TB_ajaxContent').css({'height':content_height-title_height-footer_height-15});
			  //colorpicker controls
			  $('.magee_shortcodes_container .wp-color-picker-field').each(function(){
					var color = $(this).attr('value');
					$(this).css("background-color",color);
					var since = 0 ;
					var show = $(this); 
					$(this).parents('.wp-picker-container').find('.wp-picker-holder').mouseover(function(e){
						since = 0;			
						event.cancelBubble=true;
					});
					$(this).parents('.wp-picker-container').find('.wp-picker-holder').mouseout(function(e){
						since = 1;			
						event.cancelBubble=true;
					});
					$(document).mousedown(function(){
						if(since == 1){
							
							show.parents('.wp-picker-container').find('.wp-picker-holder').css("display","none");
							}						   
					});
					$(this).click(function(){
						$(this).parents('.wp-picker-container').find('.wp-picker-holder').css("display","block");	   
					});	
					
			  });
			  //add shortcode name 
			  $('#TB_ajaxWindowTitle> span:first-child').before("&nbsp;<i class='fa fa-angle-right title_icon' ></i>&nbsp;");
			  $('#TB_ajaxWindowTitle> span').append($("#magee-shortcodes-settings-inner h2").text());
			  //when image compare to be hidden
			  if($('h2.shortcode-name').text() == 'Image Compare Shortcode'){
				  $('.TB_footer .magee-shortcodes-preview').css("display","none") ;
			  }
			  //input number controls
			  
			  $('.magee-form-number').each(function(){
				  var number_obj = $(this);
				  var number = parseInt($(this).attr('max'));
				  var total =parseInt($(this).parent('.field').find('.probar').width());
				  var op = total/number;
				  var val = parseInt($(this).val());
				  var left = op*val.toString();
				  $(this).parent('.field').find('.probar-control').css('left',left);							
				  $(this).parents('.param-item').find('.probar').click(function(e){
						e = e||window.event;
						var x2 = e.clientX;
						var x3 = $(this).parents('.param-item').find('.probar').offset().left;
						
						var lv = (x2-x3)/total*100;
						$(this).parents('.param-item').find('.probar-control').css('left',lv.toString()+'%');
						if(Math.round(parseInt($(this).parents('.param-item').find('.probar-control').css('left'))/op) > number){
							number_obj.val(number);	
							}else{
								number_obj.val(Math.round(parseInt($(this).parents('.param-item').find('.probar-control').css('left'))/op));
								}
						
				  });										
				  $(this).change(function(){
						if(parseInt($(this).val()) > number){
							$(this).parents('.param-item').find('.probar-control').css('left','100%');
							}else{
							newleft = op*parseInt($(this).val()).toString();
						    $(this).parents('.param-item').find('.probar-control').css('left',newleft);	
								}				  												
						 });
				  var z  = 0 ;
				  var x1,y1;
				  $(this).parents('.param-item').find('.probar-control').mousedown(function(e){								 
						 z = 1;
						 e = e||window.event;    
						 x1 = $(this).parents('.param-item').find('.probar').offset().left;
						 y1 = x1 + total;
						 
						 });
				 
				 $(document).mousemove(function(e){								
						 if(z == 1){	 
							 var e=e||window.event;		
							 var x = e.clientX;
							 if(x>y1 || x< x1){
									 if(x>y1){	 
										number_obj.parents('.param-item').find('.probar-control').css('left','100%') ;								   
										 }
									 if(x < x1){
										   number_obj.parents('.param-item').find('.probar-control').css('left','0%')	 ;			   																					 
										 }
								 }else{
								 var pc = (x-x1)/total*100;
								 number_obj.parents('.param-item').find('.probar-control').css('left',pc.toString()+'%');
								 number_obj.val(Math.round(parseInt(number_obj.parents('.param-item').find('.probar-control').css('left'))/op));							   										
								 }
							 }
						
						 });
				  $(document).mouseup(function(){
						 z = 0;												
						 })	;			  			   																						
              });
			  
			  //input choose controls 
			  $('.choose-show').each(function(){
				  if($(this).find('.choose-show-param').eq(0).is(':hidden') && $(this).find('.choose-show-param').eq(1).is(':hidden')){
				  var value = $(this).find('.choose-show-param').eq(0).attr('name');
				  $(this).parents('.param-item').find('.magee-form-choose').val(value);
				  $(this).find('.choose-show-param').eq(0).css('display','block');
				     if($(this).find('.choose-show-param').eq(0).text() == 'Yes'){$(this).css({'background-color':'#CCF7D5','color': '#17A534','font-weight': 'bold'});}
					 if($(this).find('.choose-show-param').eq(0).text() == 'No'){$(this).css({'background-color':'#FFDEDE','color': '#ff0000','font-weight': 'bold'});}
				  }else{
				  if($(this).find('.choose-show-param').eq(0).is(':hidden')){
					  var value = $(this).find('.choose-show-param').eq(1).attr('name');
					  $(this).parents('.param-item').find('.magee-form-choose').val(value);
					  if($(this).find('.choose-show-param').eq(1).text() == 'Yes'){$(this).css({'background-color':'#CCF7D5','color': '#17A534','font-weight': 'bold'});}
					  if($(this).find('.choose-show-param').eq(1).text() == 'No'){$(this).css({'background-color':'#FFDEDE','color': '#ff0000','font-weight': 'bold'});}
					  }else{
					  var value = $(this).find('.choose-show-param').eq(0).attr('name');
				      $(this).parents('.param-item').find('.magee-form-choose').val(value);
					  if($(this).find('.choose-show-param').eq(0).text() == 'Yes'){$(this).css({'background-color':'#CCF7D5','color': '#17A534','font-weight': 'bold'});}
					  if($(this).find('.choose-show-param').eq(0).text() == 'No'){$(this).css({'background-color':'#FFDEDE','color': '#ff0000','font-weight': 'bold'});}
					  }	  					  					  
				  }									
													
													
			  });
			  //return 
			  $("#TB_ajaxContent").scroll(function(){								   
			  var scrollvalue = $(this).scrollTop();
			  if( scrollvalue >= 300 ){
				$(".magee-shortcode-return").css("display","block");  
				 }else{ 
					$(".magee-shortcode-return").css("display","none");  
					 }
					 
		      });  
			  $(".magee-shortcode-return").click(function(){									 
					$("#TB_ajaxContent").animate({scrollTop:0},500);					 		 
			  });
			  //date picker
			  $(".magee-form-datetime").combodate(); 
			  var year = $("select.year option:selected").text();
			  var month = $("select.month option:selected").text();
			  var day = $("select.day option:selected").text();
			  var hour = $("select.hour option:selected").text();
			  var minute = $("select.minute option:selected").text();
			  $(".magee-form-date").val(year+'-'+month+'-'+day+'  '+hour+':'+minute);
			  }});
		     
		   		
		},
		error:function(){
			}
		});
  
});

//preview
$(document).on("click",'.magee-shortcodes-preview',function(e){	
																	
					 var data1={							   
                                action:"js"
                            };
					    e.stopPropagation();
					    var preview_height = $("#TB_window").height()-40;
						
                        $("#preview").css({"display":"block","position": "absolute","width": "1200px","height":preview_height,"top": "0px","left": "-200px"});  
						
						var height = $("#preview").height()-$(".preview-title").height()-50;
						var  iframe = "<iframe id='magee-sc-form-preview' width='100%' height='"+height.toString()+"'></iframe>";	
						
					    if($("#magee-sc-form-preview").length>0){
							
						$("#magee-sc-form-preview").remove();
						}		
						$("#preview").append(iframe);	
						$.ajax({
							type: "POST",
						    url: ajaxurl,
							dataType: "html",
							data:{action: "js" },   
							success:function(data){	
							   $("#magee-sc-form-preview").contents().find("head").append(data);	
							},
							error:function(){
								}
					    });
						//$.post(ajaxurl, data1,function(responsive) {  
                                									
                        //});		
						
						var html = $('#magee_shortcodes_container form').serializeArray();
						var shortcode = $('#magee_shortcodes_container form').find("input#magee-shortcode").val();
						var data=
						$.ajax({
							type: "POST",
						    url: ajaxurl,
							dataType: "html",   
							data:{name:shortcode,  action:"say",preview:html},
							success:function(data){
								$("#magee-sc-form-preview").contents().find("body").append(data); 
								//accordion
								num = $("#magee-sc-form-preview").contents().find(".panel-heading").length ;
								for($i=0;$i<num;$i++){
									  $("#magee-sc-form-preview").contents().find(".panel-heading").eq($i).on("click",function(e){
										  e.preventDefault();	
										  if($(this).find("a").attr("class") == "accordion-toggle" || $(this).find("a").attr("class") == "accordion-toggle "){
										  $(this).find("a").addClass("collapsed");
										  $(this).find("a").attr("aria-expanded","false");
										  $(this).next().removeClass("in");		
										  }else{
										  $(this).find("a").removeClass("collapsed");
										  $(this).find("a").attr("aria-expanded","true");
										  $(this).next().addClass("in");
										  $(this).parent(".panel-default").siblings().find("a").addClass("collapsed");
										  $(this).parent(".panel-default").siblings().find("a").attr("aria-expanded","false");
										  $(this).parent(".panel-default").siblings().find(".panel-heading").next().removeClass("in");		
										  }
									   }); 
								  };
								$("#magee-sc-form-preview").contents().find(".panel-title").each(function(){
									if($(this).find(".open-magee-accordion").length>0 || $(this).find(".close-magee-accordion").length>0){
										var open_icon =$(this).find("i").attr("data-open");
										var close_icon = $(this).find("i").attr("data-close");
										var now_class = $(this).find("i").attr("class");
										$(this).click(function(){					
										  if($(this).find("i").hasClass("open-magee-accordion")){ 
											  var new_class = now_class.replace("open-magee-accordion","close-magee-accordion").replace(open_icon,close_icon);
											  $(this).find("i").attr("class",new_class);
											  }else{
											  var new_class = now_class.replace("close-magee-accordion","open-magee-accordion").replace(close_icon,open_icon);
											  $(this).find("i").attr("class",new_class);
											  $(this).parents(".panel-default").siblings().each(function(){
												  var sub_icon1 =  $(this).find(".panel-title i").attr("data-open");
												  var sub_icon2 =  $(this).find(".panel-title i").attr("data-close");
												  var sub_class = $(this).find(".panel-title i").attr("class");
												  var new_sub_class = sub_class.replace("open-magee-accordion","close-magee-accordion").replace(sub_icon1,sub_icon2);
												  $(this).find(".panel-title i").attr("class",new_sub_class);															 
																											 
											  });
											  }					  				   								   
										  });						
									}	   
							  });	
								
							  //alert
							  if($("#magee-sc-form-preview").contents().find(".magee-alert .close").length>0 ){
								$("#magee-sc-form-preview").contents().find(".magee-alert .close").each(function(){
										$(this).click(function(){
											$(this).parent(".magee-alert").remove();				   
															   
										});															  
								});
							  }	
							  
							  //audio
							 if($("#magee-sc-form-preview").contents().find('.ms-audio').length>0 ){
							 $("#magee-sc-form-preview").contents().find('.ms-audio').audioPlayer({
											classPrefix: 'audioplayer',
											strPlay: 'Play',
											strPause: 'Pause',
											strVolume: 'Volume',
											strControls : $("#magee-sc-form-preview").contents().find('.ms-audio').data('controls'),
											strStyle : $("#magee-sc-form-preview").contents().find('.ms-audio').data('style'),
							 });
							 }
							 
							 //button
							 $("#magee-sc-form-preview").contents().find("a").on("click",function(e){
									if($(this).attr("href") == "#"){
									   e.preventDefault();
									}
							 });
							 //counter
							 if($("#magee-sc-form-preview").contents().find(".magee-counter-box .counter-num").length>0){
							 $("#magee-sc-form-preview").contents().find('.magee-counter-box .counter-num').counterUp({
								 delay: 10,
								 time: 1000
							 }); 
							 }
							 //countdowns
							 if(jQuery("#magee-sc-form-preview").contents().find(".magee-countdown-circle-type").length>0 ){
						 
							  obj =jQuery("#magee-sc-form-preview").contents().find(".magee-countdown-circle-type");
							  jQuery("#magee-sc-form-preview").contents().find('head').append('<link rel="stylesheet" id="wpd_google_fonts" href="'+obj.data('google_url')+'"/>');
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
							
							  }
							 //dailymotion
							 if($("#magee-sc-form-preview").contents().find(".magee-dailymotion").length>0){
							   	 dail = $("#magee-sc-form-preview").contents().find(".magee-dailymotion");
								 if( dail.data("width") == '100%' || dail.data("width") == '' &&  dail.data("height") == '100%' || dail.data("height") == ''){
								 width = dail.width();
								 iframewidth = dail.find("iframe").eq(0).width();
								 iframeheight = dail.find("iframe").eq(0).height();
								 op = iframeheight/iframewidth;
								 dail.find("iframe").eq(0).width(width-100);
								 dail.find("iframe").eq(0).height(op*(width-100));
								 }
							 }
							 
							 //document
							 if($("#magee-sc-form-preview").contents().find(".magee-document").length>0){
								doc =  $("#magee-sc-form-preview").contents().find(".magee-document");
								if(doc.data("responsive") == 'yes'){
									width = doc.width();
									if(width < doc.data("width")){
									 op = doc.data("height")/doc.data("width");
									 doc.find("iframe").eq(0).width(width);
									 doc.find("iframe").eq(0).height(op*width);
									 } 
								}
							 }
							 
							 //expand
							 if($("#magee-sc-form-preview").contents().find(".magee-expand").length>0){
								expand = $("#magee-sc-form-preview").contents().find(".magee-expand");
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
											$(this).html(more);
										  },
								 function(){	      				  
											$(this).html(less);
										  }
								 );
							     expand.find(".expand-control").click(function(){
								  expand.find(".expand-content").slideToggle(500);
								 });    
							 }
							 
							 //heading
							 if($("#magee-sc-form-preview").contents().find(".magee-heading").length>0){
								 magee_heading = $("#magee-sc-form-preview").contents().find(".magee-heading");
								 if(magee_heading.data("responsive") == 'yes'){
							     $("#magee-sc-form-preview").ready(function(){
									  if($("#magee-sc-form-preview").contents().find("body").width() <1200){	
									  newPercentage = (($("#magee-sc-form-preview").contents().find("body").width() / 1200) * 100) + "%";
									  $("#magee-sc-form-preview").contents().find(".magee-heading .heading-inner").css({"font-size": newPercentage});
									  }	
								 });
								 $("#preview",window.parent.document).resize(function (){
									  
									  if($("#magee-sc-form-preview").contents().find("body").width() <1200){
									  newPercentage = (($("#magee-sc-form-preview").contents().find("body").width() / 1200) * 100) + "%";
									  $("#magee-sc-form-preview").contents().find(".magee-heading .heading-inner").css({"font-size": newPercentage});
									  }else{
									  $("#magee-sc-form-preview").contents().find(".magee-heading .heading-inner").css({"font-size": magee_heading.data("fontsize")});
									  }
								  }); 
								 }
							 } 
							 
							 //image frame 
							 if($("#magee-sc-form-preview").contents().find("a[rel^=\'prettyPhoto\']").length>0){
							 $("#magee-sc-form-preview").contents().find("a[rel^=\'prettyPhoto\']").prettyPhoto();
							 }
							 
							 //modal
							 
							 var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9+/=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/rn/g,"n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}
							 if($("#magee-sc-form-preview").contents().find(".magee-modal-trigger").length>0){
								
								obj = $("#magee-sc-form-preview").contents().find(".magee-modal-trigger");
								obj.mgmodal({
										title: obj.data('title'),
										message	:Base64.decode(obj.data('content')),
										close_icon:obj.data('close_icon'),
										type:obj.data('effect'),
										id:obj.data('id')
									}); 		
							 }
							 
							//promo box
							 if($("#magee-sc-form-preview").contents().find(".magee-promo-box").length>0){
								 $("#magee-sc-form-preview").contents().find(".magee-promo-box .promo-action a").on("click",function(e){
									if($(this).attr("href") == "#"){
									   e.preventDefault();
									}
								 });
							 } 
							 
							//piechart
							if($("#magee-sc-form-preview").contents().find(".magee-chart-box").length>0){
							piechart = $("#magee-sc-form-preview").contents().find(".magee-chart-box");
							piechart.easyPieChart({
								barColor: piechart.data("barcolor"),
								trackColor: piechart.data("trackcolor"),
								scaleColor: false,
								lineWidth: 10,
								trackWidth: 10,
								size: piechart.data("size"),
								lineCap: piechart.data("linecap")
							  }); 
							}
							 
							//popover
							if($("#magee-sc-form-preview").contents().find(".popover-preview").length>0){
								magee_popver = $("#magee-sc-form-preview").contents().find(".popover-preview");
								$('#magee-sc-form-preview').contents().find('.popover-preview').css({"position":"relative","top":"100px","left":"200px"});
								$('#magee-sc-form-preview').contents().find('.popover-preview').on( magee_popver.data("trigger"),function(){
									if($('#magee-sc-form-preview').contents().find('.popover').length>0){
									$('#magee-sc-form-preview').contents().find('.popover').remove();
									}else{
									var html = '<div class="popover-preview-hidden popover fade '+ magee_popver.data("placement") + ' in" role="tooltip" style="display: block;"><div class="arrow"></div><h3 class="popover-title">'+ magee_popver.data("original-title") +'</h3><div class="popover-content">'+ magee_popver.data("content")+'</div></div>';			
									$('#magee-sc-form-preview').contents().find('span').after(html);	
									var hidden = $('#magee-sc-form-preview').contents().find('.popover-preview-hidden');
										if(hidden.attr('class').indexOf('top')>=0){
											size = ($('#magee-sc-form-preview').contents().find('.popover-preview').width()/2+200-hidden.width()/2).toString();
											hidden.css({"position":"absolute","top":"25px","left":size+"px"});}
										if(hidden.attr('class').indexOf('bottom')>=0){
											size = ($('#magee-sc-form-preview').contents().find('.popover-preview').width()/2+200-hidden.width()/2).toString();
											hidden.css({"position":"absolute","top":"116px","left":size+"px"});}
										if(hidden.attr('class').indexOf('left')>=0){
											size_width = (200-(hidden.width()+10)).toString();
											size_height = ($('#magee-sc-form-preview').contents().find('.popover-preview').height()/2+100-hidden.height()/2).toString();
											hidden.css({"position":"absolute","top":size_height+"px","left":size_width+"px"});}
										if(hidden.attr('class').indexOf('Right')>=0){
											size_width = (200+$('#magee-sc-form-preview').contents().find('.popover-preview').width()).toString();
											size_height = ($('#magee-sc-form-preview').contents().find('.popover-preview').height()/2+100-hidden.height()/2).toString();
											hidden.css({"position":"absolute","top":size_height+"px","left":size_width+"px"});}
									}	
										
								});
								
						     } 
							 
							 //social
							 if($("#magee-sc-form-preview").contents().find("a.magee-icon").length>0){
								 magee_social = $('#magee-sc-form-preview').contents().find('a.magee-icon');
							     $('#magee-sc-form-preview').contents().find('a.magee-icon').css({"position":"relative","top":"50px","left":"200px"});
								 $('#magee-sc-form-preview').contents().find('a.magee-icon').on('click',function(e){
									if($(this).attr('href') == '#'){
									   e.preventDefault();
									}
								 });
								 $('#magee-sc-form-preview').contents().find('a.magee-icon').on('hover',function(){
									 if($('#magee-sc-form-preview').contents().find('#tooltip-hidden').length>0){
									   $('#magee-sc-form-preview').contents().find('#tooltip-hidden').remove();
									   }else{
									   var html = '<div class="tooltip fade top in" id="tooltip-hidden" role="tooltip" style="display: block;"><div class="tooltip-arrow"></div><div class="tooltip-inner">'+ magee_social.data("original-title") +'</div></div>';
									   $('#magee-sc-form-preview').contents().find('a.magee-icon').after(html);
									   var hidden = $('#magee-sc-form-preview').contents().find('#tooltip-hidden');
									   size = ($('#magee-sc-form-preview').contents().find('a.magee-icon').width()/2+200-hidden.width()/2).toString();
									   hidden.css({"position":"absolute","top":"20px","left":size+"px"});
									   }				   
								 });  	 
							 }
							 
							 //tabs
							 if($("#magee-sc-form-preview").contents().find(".magee-tab-box>ul>li").length>0){
								  num = $("#magee-sc-form-preview").contents().find(".magee-tab-box>ul>li").length;
								  for($i=0;$i<num;$i++){
									 $("#magee-sc-form-preview").contents().find(".magee-tab-box>ul>li").eq($i).on("click",function(e){
										 e.preventDefault();	  
										 if($(this).attr("class") == ""){
										 $(this).addClass("active").siblings().attr("class",""); 
										 $(this).find("a").attr("aria-expanded","true");
										 $(this).siblings().find("a").attr("aria-expanded","false");
										 $(this).parents(".magee-tab-box").find(".tab-pane").eq($(this).index()).addClass("active in").siblings().removeClass("active in");
										 }
									 });
								 }
							 } 
							 
							 //tooltip
							 if($("#magee-sc-form-preview").contents().find(".tooltip-text").length>0){
								magee_tooltip = $("#magee-sc-form-preview").contents().find(".tooltip-text");
								magee_tooltip.css({"position":"relative","top":"50px","left":"200px"});
								magee_tooltip.on(magee_tooltip.data("trigger"),function(){
								   if($('#magee-sc-form-preview').contents().find('#tooltip-hidden').length>0){
								   $('#magee-sc-form-preview').contents().find('#tooltip-hidden').remove();
								   }else{
								   var html = '<div class="tooltip fade '+magee_tooltip.data("placement") +' in" id="tooltip-hidden" role="tooltip" style="display: block;"><div class="tooltip-arrow"></div><div class="tooltip-inner">'+magee_tooltip.data("original-title") +'</div></div>';
								   magee_tooltip.after(html);
								   var hidden = $('#magee-sc-form-preview').contents().find('#tooltip-hidden');
										if(hidden.attr('class').indexOf('top')>=0){
											size = (magee_tooltip.width()/2+200-hidden.width()/2).toString();
											hidden.css({"position":"absolute","top":"25px","left":size+"px"});}
										if(hidden.attr('class').indexOf('bottom')>=0){
											size = (magee_tooltip.width()/2+200-hidden.width()/2).toString();
											hidden.css({"position":"absolute","top":"68px","left":size+"px"});}
										if(hidden.attr('class').indexOf('left')>=0){
											size_width = (200-(hidden.width()+10)).toString();
											size_height = (magee_tooltip.height()/2+50-hidden.height()/2).toString();
											hidden.css({"position":"absolute","top":size_height+"px","left":size_width+"px"});}
										if(hidden.attr('class').indexOf('right')>=0){
											size_width = (200+magee_tooltip.width()).toString();
											size_height = (magee_tooltip.height()/2+50-hidden.height()/2).toString();
											hidden.css({"position":"absolute","top":size_height+"px","left":size_width+"px"});}	   
								   }  
			
								});
							 }
							 
							 //vimeo
							 if($("#magee-sc-form-preview").contents().find(".vimeo-video").length>0){
								magee_vimeo =  $("#magee-sc-form-preview").contents().find(".vimeo-video");
								if( magee_vimeo.data("width") == '100%' || magee_vimeo.data("height") == '100%' && magee_vimeo.data("width") == '' || magee_vimeo.data("height") == ''){
									divwidth = magee_vimeo.width();
									width = magee_vimeo.find("iframe.magee-vimeo").width();
									height = magee_vimeo.find("iframe.magee-vimeo").height();
									op = height/width;
									magee_vimeo.find("iframe.magee-vimeo").width(divwidth-100);
									magee_vimeo.find("iframe.magee-vimeo").height(op*divwidth-100);
									}
							 }
							 
							 		 
								},   
							error:function(){
								}   
							   
						});
						
				}) ;			

$(document).on("click","a.magee-shortcodes-home",function(){
            var height = $(window).height()-150;
	        $('#TB_ajaxContent').css('height',height);		
            $("#magee-shortcodes-settings").hide();
			$("#TB_footer").remove();
		    $("#magee-shortcodes-settings-innter").html("");
		    $(".magee_shortcodes_list").show();
			$("#TB_ajaxWindowTitle").find("i").remove();
			$("#TB_ajaxWindowTitle").find("span").html('');
			$("#TB_ajaxWindowTitle").html($("#TB_ajaxWindowTitle").html().replace(/&nbsp;/g,''));
			$("#preview").css("display","none");													  
			$("#magee-sc-form-preview").remove();
		});
		
// insert shortcode into editor
$(document).on("click",".magee-shortcode-insert",function(e){

    var obj       = $(this);
	var form      = $("#magee_shortcodes_container form");
	var shortcode = form.find("input#magee-shortcode").val();

	$.ajax({
		type: "POST",
		url: ajaxurl,
		dataType: "html",
		data: { shortcode: shortcode, action: "magee_create_shortcode",attr:form.serializeArray()},
		
		success:function(data){
	
		window.magee_wpActiveEditor = window.wpActiveEditor;
		// Insert shortcode
		window.wp.media.editor.insert(data);
		// Restore previous editor
		window.wpActiveEditor = window.magee_wpActiveEditor;
tb_remove();
		},
		error:function(){
			tb_remove();
		// return false;
		}
		});
		// return false;
   });

 //iconpicker
 $(document).on("click",".iconpicker i",function(e){
    var icon = $(this).data('name');
	$('.iconpicker i').removeClass('selected');
	$(this).parent('.iconpicker').siblings('.icon-val').find('input').val(icon);
	$(this).addClass('selected');
	$(this).parent('.iconpicker').css('display','none');
  });
 
 
     // activate upload button
    $('.magee-upload-button').live('click', function(e) {
	    e.preventDefault();

        upid = $(this).attr('data-upid');

        if($(this).hasClass('remove-image')) {
            $('.magee-upload-button[data-upid="' + upid + '"]').parent().find('img').attr('src', '').hide();
            $('.magee-upload-button[data-upid="' + upid + '"]').parent().find('input').attr('value', '');
            $('.magee-upload-button[data-upid="' + upid + '"]').text('Upload').removeClass('remove-image');

            return;
        }

        var file_frame = wp.media.frames.file_frame = wp.media({
            title: 'Select Image',
            button: {
                text: 'Select Image',
            },
	        frame: 'post',
            multiple: false  // Set to true to allow multiple files to be selected
        });

	    file_frame.open();

        $('.media-menu a:contains(Insert from URL)').remove();

        file_frame.on( 'select', function() {
            var selection = file_frame.state().get('selection');
            selection.map( function( attachment ) {
                attachment = attachment.toJSON();

                $('.magee-upload-button[data-upid="' + upid + '"]').parent().find('img').attr('src', attachment.url).show();
                $('.magee-upload-button[data-upid="' + upid + '"]').parent().find('input').attr('value', attachment.url);

            });

            $('.magee-upload-button[data-upid="' + upid + '"]').text('Remove').addClass('remove-image');
            $('.media-modal-close').trigger('click');
        });

	    file_frame.on( 'insert', function() {
		    var selection = file_frame.state().get('selection');
		    var size = jQuery('.attachment-display-settings .size').val();

		    selection.map( function( attachment ) {
			    attachment = attachment.toJSON();

			    if(!size) {
				    attachment.url = attachment.url;
			    } else {
				    attachment.url = attachment.sizes[size].url;
			    }

			    $('.magee-upload-button[data-upid="' + upid + '"]').parent().find('img').attr('src', attachment.url).show();
			    $('.magee-upload-button[data-upid="' + upid + '"]').parent().find('input').attr('value', attachment.url);

		    });

		    $('.magee-upload-button[data-upid="' + upid + '"]').text('Remove').addClass('remove-image');
		    $('.media-modal-close').trigger('click');
	    });
    });

    //	column remove and add
	 $(document).on('click',"a.child-clone-row-remove.magee-shortcodes-button",function(){
			
			$(this).parents(".column-shortcode-inner")	.remove();
	        
			
												 
	 });
	// ADD control 	 
	 $(document).on('click',"a.child-shortcode-add",function(){															 
			var html = '<div class="param-item"><a id="child-shortcode-remove" href="#" class="child-clone-row-remove magee-shortcodes-button ">Remove</a></div>';
			$clone = $(this).parents("#magee_shortcodes_container").find(".magee-shortcodes-settings-inner-clone").html();
			//$clone.find('.wp-color-picker-field').wpColorPicker();
			//$clone.removeClass("magee-shortcodes-settings-inner-clone hidden");
			//$clone.addClass("column-shortcode-inner");
			var count = $('.column-shortcode-inner').length;
			var wraptext = '<div class="column-shortcode-inner">'+$clone+html+'</div>';
			$(".shortcode-add").before(wraptext);
			var myclone_Options = {
		    change: function(event, ui){
			   $('#magee_shortcodes_container .column-shortcode-inner').eq(count).find('.wp-color-picker-field').each(function(){								
					var color = $(this).parents('.wp-picker-container').eq(0).find('.wp-color-result').css("background-color");
					$(this).css("background-color",color);
					var  top = parseInt($(this).parents('.wp-picker-container').find('a.iris-square-value').css("top").replace('px',''));
					var percent = parseInt($(this).parents('.wp-picker-container').find('div.iris-slider-offset span').css("bottom"));
					if(top < 87 && percent < 97){
						$(this).css({"color":"black",'background-color':color});
						}else{
							$(this).css({"color":"white",'background-color':color});
							}
			   });
			   },
			 defaultColor: true,  
			};
			$('#magee_shortcodes_container .column-shortcode-inner').eq(count).find('.wp-color-picker-field').wpColorPicker(myclone_Options);
			$('#magee_shortcodes_container .column-shortcode-inner').eq(count).find('.wp-color-picker-field').each(function(){
					var color = $(this).attr('value');
					$(this).css("background-color",color);
					var since = 0 ;
					var show = $(this); 
					$(this).parents('.wp-picker-container').find('.wp-picker-holder').mouseover(function(e){
						since = 0;			
						event.cancelBubble=true;
					});
					$(this).parents('.wp-picker-container').find('.wp-picker-holder').mouseout(function(e){
						since = 1;			
						event.cancelBubble=true;
					});
					$(document).mousedown(function(){
						if(since == 1){
							show.parents('.wp-picker-container').find('.wp-picker-holder').css("display","none");
							}						   
					});
					$(this).click(function(){			   			   
						$(this).parents('.wp-picker-container').find('.wp-picker-holder').css("display","block");	   
					});	
					
			  });
			 //input number controls
			  
			  $('.magee_shortcodes_container .column-shortcode-inner').eq(count).find('.magee-form-number').each(function(){
				  var number_obj = $(this);
				  var number = parseInt($(this).attr('max'));
				  var total =parseInt($(this).parent('.field').find('.probar').width());
				  var op = total/number;
				  var val = parseInt($(this).val());
				  var left = op*val.toString();
				  $(this).parent('.field').find('.probar-control').css('left',left);							
				  $(this).parents('.param-item').find('.probar').click(function(e){
						e = e||window.event;
						var x2 = e.clientX;
						var x3 = $(this).parents('.param-item').find('.probar').offset().left;
						
						var lv = (x2-x3)/total*100;
						$(this).parents('.param-item').find('.probar-control').css('left',lv.toString()+'%');
						number_obj.val(Math.round(parseInt($(this).parents('.param-item').find('.probar-control').css('left'))/op));	
				  });										
				  $(this).change(function(){
						if(parseInt($(this).val()) > number){
							$(this).parents('.param-item').find('.probar-control').css('left','100%');
							}else{
							newleft = op*parseInt($(this).val()).toString();
						    $(this).parents('.param-item').find('.probar-control').css('left',newleft);	
								}				  												
						 });
				  var z  = 0 ;
				  var x1,y1;
				  $(this).parents('.param-item').find('.probar-control').mousedown(function(e){								 
						 z = 1;
						 e = e||window.event;    
						 x1 = $(this).parents('.param-item').find('.probar').offset().left;
						 y1 = x1 + total;
						 
						 });
				 
				 $(document).mousemove(function(e){								
						 if(z == 1){	 
							 var e=e||window.event;		
							 var x = e.clientX;
							 if(x>y1 || x< x1){
									 if(x>y1){	 
										number_obj.parents('.param-item').find('.probar-control').css('left','100%') ;								   
										 }
									 if(x < x1){
										   number_obj.parents('.param-item').find('.probar-control').css('left','0%')	 ;			   																					 
										 }
								 }else{
								 var pc = (x-x1)/total*100;
								 number_obj.parents('.param-item').find('.probar-control').css('left',pc.toString()+'%');
								 number_obj.val(Math.round(parseInt(number_obj.parents('.param-item').find('.probar-control').css('left'))/op));							   										
								 }
							 }
						
						 });
				  $(document).mouseup(function(){
						 z = 0;												
						 })	;			  			   																						
              });
	 });

	// type choose to show
	$(document).on('click','.choose-show',function(){
		$(this).each(function(){
			if($(this).find(".choose-show-param").eq(0).is(':hidden')){
			   $(this).find(".choose-show-param").eq(1).css("display","none");
			   var value = $(this).find(".choose-show-param").eq(0).attr("name");
			   $(this).parents('.param-item').find(".magee-form-choose").val(value);
			   $(this).find(".choose-show-param").eq(0).css("display","block");
			   if($(this).find(".choose-show-param").eq(0).text() == 'Yes'){$(this).css({'background-color':'#CCF7D5','color': '#17A534','font-weight': 'bold'});}
			   if($(this).find(".choose-show-param").eq(0).text() == 'No'){$(this).css({'background-color':'#FFDEDE','color': '#ff0000','font-weight': 'bold'});}
			}else{
				   $(this).find(".choose-show-param").eq(0).css("display","none");
				   var value = $(this).find(".choose-show-param").eq(1).attr("name");
				   $(this).parents('.param-item').find(".magee-form-choose").val(value);
				   $(this).find(".choose-show-param").eq(1).css("display","block");	
				   if($(this).find(".choose-show-param").eq(1).text() == 'Yes'){$(this).css({'background-color':'#CCF7D5','color': '#17A534','font-weight': 'bold'});}
				   if($(this).find(".choose-show-param").eq(1).text() == 'No'){$(this).css({'background-color':'#FFDEDE','color': '#ff0000','font-weight': 'bold'});}
			}											  
		});
	});
    // change end time for countdown
	$(document).on('change',"span.combodate select",function(){													 
		var year = $("select.year option:selected").text();
		var month = $("select.month option:selected").text();
		var day = $("select.day option:selected").text();
		var hour = $("select.hour option:selected").text();
        var minute = $("select.minute option:selected").text();
		$(".magee-form-date").val(year+'-'+month+'-'+day+'  '+hour+':'+minute);											  											  						 
	});
	//choose icon to show
	$(document).on('click',".custom_icon",function(){
			$(this).each(function(){
				$(this).parents(".param-item").find(".iconpicker").css('display','block');
			});		
	});
	$(document).on('click',".magee-preview-delete",function(){
			$("#preview").css('display','none');	
			$("#magee-sc-form-preview").remove();
	});
      
 });
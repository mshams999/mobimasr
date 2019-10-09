(function($){

	$.fn.mgmodal = function(options){
	var options = $.extend({
		title: '',
	    message: '',
		close_icon : '',
		type : 'effect-1',
		id : ''
		}, options);	
     return this.each(function(){
		 var obj = $(this);
		 if(options.type === '') options.type = 'effect-1';
		 if(options.close_icon === '')options.close_icon = 'yes';
		 obj.wrap('<div class="ms-modal-wrapper"></div>');
		 obj.after('<div class="magee-modal-wrapper" id="'+options.id+'"></div>');
		 var container = obj.parent('.ms-modal-wrapper').find('.magee-modal-wrapper');
		 container.append('<div class="magee-modal magee-modal-'+options.type+'"></div><div class="magee-modal-overlay"></div>');
		 var magee_modal = container.find('.magee-modal');
		 magee_modal.append('<div class="magee-modal-content-wrapper"><div class="magee-modal-title-wrapper"></div><div class="magee-modal-content"></div></div>');
		 var magee_modal_title = container.find('.magee-modal-title-wrapper');
		 if(options.close_icon === 'yes'){
			magee_modal_title.append('<h3>'+ options.title +'<a href="javascript:void(0);" class="magee-modal-close"><i class="fa fa-remove"></i></a></h3>');
			 }else{
			 magee_modal_title.append('<h3>'+ options.title +'</h3>');	 
				 }
		 var magee_modal_content = container.find('.magee-modal-content');
		 magee_modal_content.append(options.message);
		 var modal_close_icon = container.find('a.magee-modal-close');
		 modal_close_icon.on('click',function(e){
			   e.preventDefault();
			   magee_modal.removeClass('magee-modal-show');
			 });
		 var magee_modal_overlay = container.find(".magee-modal-overlay");
		  magee_modal_overlay.on('click',function(){
			   magee_modal.removeClass('magee-modal-show');
			 });
		 obj.on('click',function(){
			 magee_modal.addClass('magee-modal-show');
			 
			 });	 	 
		 });		
		
	};
	
})(jQuery);
/*
 * Main UI file.
 *
 * Here we activate and configure all scripts or
 * jQuery plugins required for UI.
 *
 */
(function ($, window, vendor, undefined) {

	jQuery(document).one('click','.supsystic-admin-notice a, .supsystic-admin-notice button',function(event) {
		var responseCode = jQuery(this).data('response-code') || 'hide';
		var responseType = jQuery(this).data('response-type');

		jQuery('.supsystic-admin-notice .notice-dismiss').trigger('click');

		window.supsystic.Tables.request({
			module: 'tables',action: 'reviewNoticeResponse'
		},{
			responseCode: responseCode,
			responseType: responseType
		});
	});

    $(document).ready(function () {
		var activModule = (/\module=([^&#]*)/i.test($('.supsystic-navigation').find('li.active').find('a').attr('href'))) ? RegExp.$1 : 'tables';
		$('#toplevel_page_supsystic-tables').find('.wp-submenu li').removeClass('current').each(function(){
			if($(this).find('a[href$="&module='+ activModule+ '"]').size()) {
				$(this).addClass('current');
			}
		});
        var navWidth = $('.supsystic-navigation').width();
        $('.supsystic-navigation a span').each(function(){
            var el = $(this),
                fontSize = parseFloat(el.css('font-size'));
            while(el.width() > navWidth){
                el.css('font-size', fontSize -= 1);
            }
        });

        /* Bootstrap Tooltips */
        // $('body').tooltip({
        //     selector: '.supsystic-plugin [data-toggle="tooltip"]',
        //     container: 'body'
        // });

        $('[data-toggle="tooltip"]').tooltipster({
                contentAsHTML: true,
                interactive: true,
                position: 'top-left',
				delay: 1000,
                updateAnimation: false,
                animation: '',
                functionReady: function(origin) {
                    $('img').load(function(){
                        origin.tooltipster('reposition');
                    });
                }
            });

        $('[data-target-toggle]').on('click change ifChanged', function(event) {
            event.preventDefault();
            $target = $($(this).data('target-toggle'));
            $target.fadeToggle();
        });

		$('input.stbCopyTextCode').click(function(){
			this.select();
		});

        /* Minimum height for the container */
        var $autoHeight = $('.supsystic-item'),
            naviationHeight = $('.supsystic-navigation').outerHeight();

        $autoHeight.each(function () {
            $(this).css({ minHeight: naviationHeight });
        });

        $('input').iCheck({
            checkboxClass: 'icheckbox_minimal',
            radioClass:    'iradio_minimal'
        });
    });

}(jQuery, window, 'supsystic'));

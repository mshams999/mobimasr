jQuery(document).ready(function(){
	// yeah, I know - that there are core.js, but I will not load 2k rows file - only for those 2 things for now
	function createSpinner(elem) {
		elem = typeof(elem) != 'undefined' ? elem : false;

		if(elem) {
			var icon = elem.attr('disabled', true).find('.fa');

			if(icon) {
				icon.data('icon', icon.attr('class'));
				icon.attr('class', 'fa fa-spinner fa-spin');
			}
		} else {
			return $('<i/>', { class: 'fa fa-spinner fa-spin' });
		}
	}
	function deleteSpinner(elem) {
		var icon = elem.attr('disabled', false).find('.fa');

		if(icon) {
			icon.attr('class', icon.data('icon'));
			icon.data('icon', '');
		}
	}
	if(typeof(g_dtsAnimationSpeed) == 'undefined') {
		g_dtsAnimationSpeed = 300;
	}
	var $deactivateLnk = jQuery('#the-list tr[data-plugin="'+ dtsPluginsData.plugName+ '"] .row-actions .deactivate a');
	if($deactivateLnk && $deactivateLnk.length > 0) {
		var $deactivateForm = jQuery('#dtsDeactivateForm');
		var $deactivateWnd = jQuery('#dtsDeactivateWnd').dialog({
			modal:    true
		,	autoOpen: false
		,	width: 500
		,	height: 390
		,	buttons:  {
				'Submit & Deactivate': function() {
					$deactivateForm.submit();
				}
			}
		});
		var $wndButtonset = $deactivateWnd.parents('.ui-dialog:first')
			.find('.ui-dialog-buttonpane .ui-dialog-buttonset')
		,	$deactivateDlgBtn = $deactivateWnd.find('.dtsDeactivateSkipDataBtn')
		,	deactivateUrl = $deactivateLnk.attr('href');
		$deactivateDlgBtn.attr('href', deactivateUrl);
		$wndButtonset.append( $deactivateDlgBtn );
		$deactivateLnk.click(function(){
			$deactivateWnd.dialog('open');
			return false;
		});
		
		$deactivateForm.submit(function(){
			if(typeof(ajaxurl) == 'undefined') {
				window.location.href = deactivateUrl;
				return false;
			}
			var $btn = $wndButtonset.find('button:first');
			$btn.width( $btn.width() );	// Ha:)
			createSpinner($btn);
			// TODO: Re-make this to new framework workflow
			jQuery.post(ajaxurl,
			{
				action: 'supsystic-tables',
				route: {
					module: 'promo',
					action: 'saveDeactivateData'
				},
				deactivate_reason: $deactivateForm.find('[name="deactivate_reason"]').val(),
				better_plugin: $deactivateForm.find('[name="better_plugin"]').val(),
				other: $deactivateForm.find('[name="other"]').val(),
			})
			.always(function (res) {
				deleteSpinner($btn);
				window.location.href = deactivateUrl
			});
			return false;
			
		});
		$deactivateForm.find('[name="deactivate_reason"]').change(function(){
			jQuery('.dtsDeactivateDescShell').slideUp( g_dtsAnimationSpeed );
			if(jQuery(this).prop('checked')) {
				var $descShell = jQuery(this).parents('.dtsDeactivateReasonShell:first').find('.dtsDeactivateDescShell');
				if($descShell && $descShell.size()) {
					$descShell.slideDown( g_dtsAnimationSpeed );
				}
			}
		});
	}
});
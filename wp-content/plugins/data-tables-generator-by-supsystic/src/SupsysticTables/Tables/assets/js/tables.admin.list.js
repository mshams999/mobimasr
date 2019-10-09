jQuery(document).ready(function(){
// Fallback for case if library was not loaded
if(!jQuery.fn.jqGrid) {
	return;
}
var tblId = 'ddtTableTbl';

jQuery('#'+ tblId).jqGrid({
// 	url: dttTblDataUrl
// ,
	datatype: function(postdata){
		window.supsystic.Tables.request({
			module: 'tables',
			action: 'getListForTbl'
		}, {
			data:postdata,
		}).done(function (res) {
			var grid = jQuery('#'+ tblId)[0];
			grid.addJSONData(res);
		}).fail(function (error) {
			console.log(error);
		});
	}
,	mtype: 'GET'
,	autowidth: true
,	shrinkToFit: true
,	colNames:['ID', 'Title', 'Shortcode', 'Phpcode']
,	colModel:[
		{name: 'id', index: 'id', searchoptions: {sopt: ['eq']}, width: '50', align: 'center'}
	,	{name: 'title', index: 'title', searchoptions: {sopt: ['eq']}, align: 'center'}
	,	{name: 'shortcode', index: 'shortcode', searchoptions: {sopt: ['eq']}, align: 'center'}
	,	{name: 'phpcode', index: 'phpcode', searchoptions: {sopt: ['eq']}, align: 'center'}
	]
,	postData: {
		search: {
			text_like: jQuery('#'+ tblId+ 'SearchTxt').val()
		}
	}
,	rowNum:10
,	rowList:[10, 20, 30, 1000]
,	pager: '#'+ tblId+ 'Nav'
,	sortname: 'id'
,	viewrecords: true
,	sortorder: 'desc'
,	jsonReader: { repeatitems : false, id: '0' }
,	height: '100%'
,	emptyrecords: 'You have no Tables for now.'
,	multiselect: true
,	onSelectRow: function(rowid, e) {
		var tblId = jQuery(this).attr('id')
		,	selectedRowIds = jQuery('#'+ tblId).jqGrid ('getGridParam', 'selarrrow')
		,	totalRows = jQuery('#'+ tblId).getGridParam('reccount')
		,	totalRowsSelected = selectedRowIds.length;
		if(totalRowsSelected) {
			jQuery('#ddtTableRemoveGroupBtn').removeAttr('disabled');
			jQuery('#export-group').removeAttr('disabled');

			if(totalRowsSelected == totalRows) {
				jQuery('#cb_'+ tblId).prop('indeterminate', false);
				jQuery('#cb_'+ tblId).attr('checked', 'checked');
			} else {
				jQuery('#cb_'+ tblId).prop('indeterminate', true);
			}
		} else {
			jQuery('#export-group').attr('disabled', 'disabled');
			jQuery('#ddtTableRemoveGroupBtn').attr('disabled', 'disabled');
			jQuery('#cb_'+ tblId).prop('indeterminate', false);
			jQuery('#cb_'+ tblId).removeAttr('checked');
		}
		ddtCheckUpdate(jQuery(this).find('tr:eq('+rowid+')').find('input[type=checkbox].cbox'));
		ddtCheckUpdate('#cb_'+ tblId);
	}
,	gridComplete: function(a, b, c) {
		var tblId = jQuery(this).attr('id');
		jQuery('#ddtTableRemoveGroupBtn').attr('disabled', 'disabled');
		jQuery('#cb_'+ tblId).prop('indeterminate', false);
		jQuery('#cb_'+ tblId).removeAttr('checked');
		// Custom checkbox manipulation
		ddtInitCustomCheckRadio('#'+ jQuery(this).attr('id') );
		ddtCheckUpdate('#cb_'+ jQuery(this).attr('id'));
	}
,	loadComplete: function() {
		var tblId = jQuery(this).attr('id');
		if (this.p.reccount === 0) {
			jQuery(this).hide();
			jQuery('#'+ tblId+ 'EmptyMsg').show();
		} else {
			jQuery(this).show();
			jQuery('#'+ tblId+ 'EmptyMsg').hide();
		}
	}
});
jQuery('#'+ tblId).setColProp('phpcode', {sortable: false});
jQuery('#'+ tblId).setColProp('shortcode', {sortable: false});
jQuery('#'+ tblId+ 'NavShell').append( jQuery('#'+ tblId+ 'Nav') );
jQuery('#'+ tblId+ 'Nav').find('.ui-pg-selbox').insertAfter( jQuery('#'+ tblId+ 'Nav').find('.ui-paging-info') );
jQuery('#'+ tblId+ 'Nav').find('.ui-pg-table td:first').remove();
// Make navigation tabs to be with our additional buttons - in one row
jQuery('#'+ tblId+ 'Nav_center').prepend( jQuery('#'+ tblId+ 'NavBtnsShell') ).css({
	'width': '80%'
,	'white-space': 'normal'
,	'padding-top': '8px'
});
jQuery('#'+ tblId+ 'SearchTxt').keyup(function(){
	var searchVal = jQuery.trim( jQuery(this).val() );
	if( true /*searchVal && searchVal != ''*/ ) {
		ddtGridDoListSearch({
			text_like: searchVal
		}, tblId);
	}
});

jQuery('#'+ tblId+ 'EmptyMsg').insertAfter(jQuery('#'+ tblId+ '').parent());
jQuery('#'+ tblId+ '').jqGrid('navGrid', '#'+ tblId+ 'Nav', {edit: false, add: false, del: false});
jQuery('#cb_'+ tblId+ '').change(function(){
	jQuery(this).attr('checked')
		? jQuery('#ddtTableRemoveGroupBtn').removeAttr('disabled')
		: jQuery('#ddtTableRemoveGroupBtn').attr('disabled', 'disabled');

	jQuery(this).attr('checked')
		? jQuery('#export-group').removeAttr('disabled')
		: jQuery('#export-group').attr('disabled', 'disabled');
});

jQuery('#ddtTableRemoveGroupBtn').click(function(){
	var selectedRowIds = jQuery('#ddtTableTbl').jqGrid ('getGridParam', 'selarrrow')
	,	listIds = [];
	for(var i in selectedRowIds) {
		var rowData = jQuery('#ddtTableTbl').jqGrid('getRowData', selectedRowIds[ i ]);
		listIds.push( rowData.id );
	}
	var popupLabel = '';
	if(listIds.length == 1) {	// In table label cell there can be some additional links
		var labelCellData = ddtGetGridColDataById(listIds[0], 'title', 'ddtTableTbl');
		popupLabel = jQuery(labelCellData).text();
	}
	var confirmMsg = listIds.length > 1
		? 'Are you sur want to remove '+ listIds.length+ ' Tables?'
		: 'Are you sure want to remove "'+ popupLabel+ '" Table?'
	if(confirm(confirmMsg)) {
		jQuery.post(ajaxurl,
			{
				action: 'supsystic-tables',
				route: {
					module: 'tables',
					action: 'remove'
				},
				id: listIds
			})
			.success(function (res) {
				if(!res.error) {
					jQuery('#ddtTableTbl').trigger( 'reloadGrid' );
				}
			});

	}
	return false;
});
ddtInitCustomCheckRadio('#'+ tblId+ '_cb');

function ddtInitCustomCheckRadio(selector) {
	if(!jQuery.fn.iCheck) return;
	if(!selector)
		selector = document;
	jQuery(selector).find('input').iCheck('destroy').iCheck({
		checkboxClass: 'icheckbox_minimal'
		,	radioClass: 'iradio_minimal'
	}).on('ifChanged', function(e){
		// for checkboxHiddenVal type, see class htmlddt
		jQuery(this).trigger('change');
		if(jQuery(this).hasClass('cbox')) {
			var parentRow = jQuery(this).parents('.jqgrow:first');
			if(parentRow && parentRow.size()) {
				jQuery(this).parents('td:first').trigger('click');
			} else {
				var checkId = jQuery(this).attr('id');
				if(checkId && checkId != '' && strpos(checkId, 'cb_') === 0) {
					var parentTblId = str_replace(checkId, 'cb_', '');
					if(parentTblId && parentTblId != '' && jQuery('#'+ parentTblId).size()) {
						jQuery('#'+ parentTblId).find('input[type=checkbox]').iCheck('update');
					}
				}
			}
		}
	}).on('ifClicked', function(e){
		jQuery(this).trigger('click');
	});
}
function ddtCheckUpdate(checkbox) {
	if(!jQuery.fn.iCheck) return;
	jQuery(checkbox).iCheck('update');
}
function strpos( haystack, needle, offset){
	var i = haystack.indexOf( needle, offset ); // returns -1
	return i >= 0 ? i : false;
}
function str_replace(haystack, needle, replacement) {
	var temp = haystack.split(needle);
	return temp.join(replacement);
}
function ddtGridDoListSearch(param, gridSelectorId) {
	ddtGridSetListSearch(param, gridSelectorId);
	jQuery('#'+ gridSelectorId).trigger( 'reloadGrid' );
}
function ddtGridSetListSearch(param, gridSelectorId) {
	jQuery('#'+ gridSelectorId).setGridParam({
		postData: {
			search: param
		}
	});
}
function ddtGetGridColDataById(id, column, gridSelectorId) {
	var rowId = getGridRowId(id, gridSelectorId);
	if(rowId) {
		return jQuery('#'+ gridSelectorId).jqGrid ('getCell', rowId, column);
	}
	return false;
}
function getGridRowId(id, gridSelectorId) {
	var rowId = parseInt(jQuery('#'+ gridSelectorId).find('[aria-describedby='+ gridSelectorId+ '_id][title='+ id+ ']').parent('tr:first').index());
	if(!rowId) {
		console.log('CAN NOT FIND ITEM WITH ID  '+ id);
		return false;
	}
	return rowId;
}
});

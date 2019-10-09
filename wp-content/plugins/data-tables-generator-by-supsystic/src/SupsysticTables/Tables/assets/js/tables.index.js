(function ($, app) {
	$(document).ready(function () {
		var $tables = $('#tables'),
			tableList = $tables.DataTable({
				info: true,
				scrollX: true,
				pagingType: 'full_numbers',
				language: {
					search: '',
					searchPlaceholder: 'Search',
					lengthMenu: '<select>'+
						'<option value="10">10</option>'+
						'<option value="50">50</option>'+
						'<option value="200">200</option>'+
						'<option value="1000">1000</option>'+
						'</select>'
				},
				dom: '<"top"f><"clear"><"dt_rigth"il><"dt_left"p>rt',
				columnDefs: [
					{ "orderable": false, "targets": [0, 4, 5, 6] },
					{ "className": "dt-right", "targets": [0, 1] },
					{ "className": "dt-center", "targets": [3, 6] }
				],
				order: [[1, 'asc']],
				fnInitComplete: function () {
					setCustomStyle();
					setCheckboxesClick();
				}
			});

		tableList.on('draw', function () {
			setCustomStyle();
			controlCheckboxes($('.icheckbox_minimal'), false);
			setCheckboxesClick();
			setGroupBtn();
		});
		tableList.on('search', function () {
			setCustomStyle();
		});

		function setCustomStyle() {
			var info = $('.dataTables_info');

			info.text(info.text().replace('Showing', 'View').replace('to', '-').replace(' entries', ' '));
			$('.paginate_button').removeClass('paginate_button').addClass('paginate_links');
			$('#tables_first').empty().append($('<i>').addClass('fa fa-angle-double-left'));
			$('#tables_last').empty().append($('<i>').addClass('fa fa-angle-double-right'));
			$('#tables_previous').empty().append($('<i>').addClass('fa fa-angle-left'));
			$('#tables_next').empty().append($('<i>').addClass('fa fa-angle-right'));
		}
		function setGroupBtn() {
			var checked = $('.icheckbox_minimal').filter('.checked');

			if (checked && checked.length > 0) {
				$('#delete-group').removeAttr('disabled');
				$('#export-group').removeAttr('disabled');
			} else {
				$('#delete-group').attr('disabled', 'disabled');
				$('#export-group').attr('disabled', 'disabled');
			}
		}

		function setCheckboxesClick() {
			$('.iCheck-helper').off('click.group').on('click.group', function() {
				var icheckbox = $(this).closest('.icheckbox_minimal'),
					checked = icheckbox.attr('class').indexOf('checked') >= 0,
					id = icheckbox.find('input').attr('id')

				if (id == 'check_all') {
					controlCheckboxes($('.icheckbox_minimal'), checked);
				} else if(!checked) {
					controlCheckboxes($('.icheckbox_minimal').has('#check_all'), false);
				}
				setGroupBtn();
			});
		}
		function controlCheckboxes(obj, check) {
			if(check) {
				obj.addClass('checked').find('input').attr('checked','checked');
			} else {
				obj.removeClass('checked').find('input').removeAttr('checked');
			}
		}

		$(document).on('click', '.delete-table', function (e) {
			e.preventDefault();

			if (!confirm('Are you sure?')) {
				return;
			}
			var $btn = $(this);

			$btn.find('i').removeClass('fa-trash-o').addClass('fa-spin fa-circle-o-notch');
			app.request({
					module: 'tables',
					action: 'remove'
				}, {
					id: parseInt($btn.parents('tr').data('table-id'))
				}).done(function () {
						$btn.parents('tr').fadeOut(function () {
							$(this).remove();
							if ($tables.find('tr').length < 4) {
								$tables.find('tr.empty').fadeIn();
						}
					});
				}).fail(function (error) {
						$btn.find('i').removeClass('fa-spin fa-circle-o-notch').addClass('fa-trash-o');
						alert(error);
				});
			return false;
		});

		$('#delete-group').on('click', function() {
			if (!confirm('Are you sure?')) {
				return;
			}
			var checks = $('.icheckbox_minimal:not(:has(#check_all))').filter('.checked'),
				ids = [];

			for (var i = 0; i < checks.length; i++) {
				ids.push(parseInt(checks.eq(i).find('input').data('table-id')));
			}

			app.request({
					module: 'tables',
					action: 'remove'
				}, {
					id: ids
				}).done(function () {
					for (i = 0; i < checks.length; i++) {
						checks.eq(i).parents('tr').fadeOut(function () {
							$(this).remove();
							if ($tables.find('tr').length < 4) {
								$tables.find('tr.empty').fadeIn();
							}
						});
					}
				}).fail(function (error) {
					alert(error);
				});
			return false;
		});

		$('.shortcode').on('click', function () { $(this).select() });

		var $proNotify = $('.pro-notify');
		$proNotify.each(function() {
			var $this = $(this);

			$($this.data('dialog')).dialog({
				autoOpen: false,
				title: $this.data('dtitle'),
				width: $this.data('dwidth'),
				modal: true,
				buttons: {
					Close: function () {
						$(this).dialog('close');
					}
				}
			})
		});
		$proNotify.on('click', function (e) {
			e.preventDefault();
			$($(this).data('dialog')).dialog('open');
			return false;
		});
	});
}(window.jQuery, window.supsystic.Tables));

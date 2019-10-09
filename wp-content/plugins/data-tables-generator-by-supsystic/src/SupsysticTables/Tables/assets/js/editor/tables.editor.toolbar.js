var g_stbCellBgColorTimeoutSet = false,
	g_stbCellTxtColorTimeoutSet = false,
	g_stbCellBgColorLast = '',
	g_stbCellTxtColorLast = '';
(function ($, app, undefined) {
	var svlFormatsClass = 'formatedCell',
		formatClasses = {
		hiddenCell: ['Hidden','hiddenCell'],
		invisibleCell: ['Invisible','invisibleCell'],
		unescapeHTML: ['UnescapeHTML','unescapeHtml'],
		editable: ['Editable','editableField'],
		selectable: ['Selectable','selectableField'],
		datefield: ['Date','datepickerField'],
		collapsibleCell: ['Collapsible','collapsibleCell'],
		tooltipCell: ['Tooltip','tooltipCell']
	};

	// Toolbar methods
	var methods = {
		bold: function () {
			this.toggleClass('bold');
			this.getEditor().render();
		},
		italic: function () {
			this.toggleClass('italic');
			this.getEditor().render();
		},
		underline: function () {
			this.toggleClass('underline');
			this.getEditor().render();
		},
		color: function (color) {
			var $style = app.getAdminCellStylesElem(),
				classes = app.getClassesRegexp();

			if($style.html().indexOf('.color-'+color) == -1) {
				$style.html($style.html() + ' .color-'+color+' {color:#'+color+' !important;'+'}');
			}
			this.replaceClass('color-' + color, classes.color);

			$('#textColor').css({borderBottomColor: '#' + color});
			this.getEditor().render();
		},
		background: function (color) {
			var classes = app.getClassesRegexp();

			if (color === 'ffffff') {
				this.removeClass(classes.background);
			} else {
				var $style = app.getAdminCellStylesElem();

				if($style.html().indexOf('.bg-'+color) == -1) {
					$style.html($style.html() + ' .bg-'+color+' {background:#'+color+' !important;}');
				}
				this.replaceClass('bg-' + color, classes.background);
			}
			$('#bgColor').css({borderBottomColor: '#' + color});
			this.getEditor().render();
		},
		size: function (e) {
			var classes = app.getClassesRegexp(),
				size = $(e.target).val();

			if (!size || size == 'default') {
				this.removeClass(classes.fontSize);
			} else {
				var $style = app.getAdminCellStylesElem();

				if($style.html().indexOf('.fsize-'+size) == -1) {
					var lineHeight = +size + 6;
					$style.html($style.html() + ' .fsize-'+size+' {font-size:'+size+'px !important; line-height:'+lineHeight+'px !important;}');
				}
				this.replaceClass('fsize-' + size, classes.fontSize);
			}
			this.getEditor().render();
		},
		left: function () {
			var classNames = this.getCellsClassNames();
			this.replaceClass('htLeft', ['htLeft', 'htCenter', 'htRight']);
			//run hook for correct work of undo/redo actions instead of use editor.getPlugin("contextMenu").executeCommand();
			this.getEditor().runHooks('beforeCellAlignment', classNames, this.getEditor().getSelectedRange(), 'horizontal', 'htLeft');
			this.getEditor().render();
		},
		right: function () {
			var classNames = this.getCellsClassNames();
			this.replaceClass('htRight', ['htLeft', 'htCenter', 'htRight']);
			//run hook for correct work of undo/redo actions instead of use editor.getPlugin("contextMenu").executeCommand();
			this.getEditor().runHooks('beforeCellAlignment', classNames, this.getEditor().getSelectedRange(), 'horizontal', 'htRight');
			this.getEditor().render();
		},
		center: function () {
			var classNames = this.getCellsClassNames();
			this.replaceClass('htCenter', ['htLeft', 'htCenter', 'htRight']);
			//run hook for correct work of undo/redo actions instead of use editor.getPlugin("contextMenu").executeCommand();
			this.getEditor().runHooks('beforeCellAlignment', classNames, this.getEditor().getSelectedRange(), 'horizontal', 'htCenter');
			this.getEditor().render();
		},
		top: function () {
			var classNames = this.getCellsClassNames();
			this.replaceClass('htTop', ['htTop', 'htMiddle', 'htBottom']);
			//run hook for correct work of undo/redo actions instead of use editor.getPlugin("contextMenu").executeCommand();
			this.getEditor().runHooks('beforeCellAlignment', classNames, this.getEditor().getSelectedRange(), 'vertical', 'htTop');
			this.getEditor().render();
		},
		middle: function () {
			var classNames = this.getCellsClassNames();
			this.replaceClass('htMiddle', ['htTop', 'htMiddle', 'htBottom']);
			//run hook for correct work of undo/redo actions instead of use editor.getPlugin("contextMenu").executeCommand();
			this.getEditor().runHooks('beforeCellAlignment', classNames, this.getEditor().getSelectedRange(), 'vertical', 'htMiddle');
			this.getEditor().render();
		},
		bottom: function () {
			var classNames = this.getCellsClassNames();
			this.replaceClass('htBottom', ['htTop', 'htMiddle', 'htBottom']);
			//run hook for correct work of undo/redo actions instead of use editor.getPlugin("contextMenu").executeCommand();
			this.getEditor().runHooks('beforeCellAlignment', classNames, this.getEditor().getSelectedRange(), 'vertical', 'htBottom');
			this.getEditor().render();
		},
		row: function () {
			var editor = this.getEditor(),
				selection = editor.getSelectedRange();

			if (selection === undefined) {
				editor.alter('insert_row', editor.countRows(), 1);
			} else {
				editor.alter('insert_row', selection.from.row, selection.to.row - selection.from.row + 1);
			}
		},
		column: function () {
			var editor = this.getEditor(),
				selection = editor.getSelectedRange();

			if (selection === undefined) {
				editor.alter('insert_col', editor.countCols(), 1);
			} else {
				editor.alter('insert_col', selection.from.col, selection.to.col - selection.from.col + 1);
			}
		},
		remove_row: function () {
			var selection = this.getEditor().getSelectedRange();

			if (selection === undefined) {
				return;
			}

			var amount = selection.to.row - selection.from.row + 1,
				selected = this.getEditor().getSelected(),
				entireColumnSelection = [0, selected[1], this.getEditor().countRows() - 1, selected[1]],
				columnSelected = entireColumnSelection.join(',') == selected.join(',');

			if (selected[0] < 0 || columnSelected) {
				return;
			}

			this.getEditor().alter('remove_row', selection.from.row, amount);
		},
		remove_col: function () {
			var selection = this.getEditor().getSelectedRange();

			if (selection === undefined) {
				return;
			}

			var amount = selection.to.col - selection.from.col + 1,
				selected = this.getEditor().getSelected(),
				entireRowSelection = [selected[0], 0, selected[0], this.getEditor().countCols() - 1],
				rowSelected = entireRowSelection.join(',') == selected.join(',');

			if (selected[1] < 0 || rowSelected) {
				return;
			}

			this.getEditor().alter("remove_col", selection.from.col, amount);
		},
		link: function () {
			var toolbar = this,
				editor = this.getEditor(),
				selection = editor.getSelectedRange();

			if (!selection) {
				alert('You must select a cell to insert link.');
			} else {
				var cellText = editor.getDataAtCell(selection.highlight.row, selection.highlight.col) || '',
					selectedText = toolbar.getSelectedText(document.getElementsByClassName("handsontableInput")[0]);

					$('#insertUrlDialog').dialog({
						autoOpen: true,
						width: 400,
						height: 'auto',
						modal: true,
						open: function() {
							var textForPopup = selectedText ? selectedText : cellText;

							textForPopup = $('<div>' + textForPopup + '</div>').html();
							$(this).find('.link-text').val(textForPopup);
						},
						close: function() {
							var $this = $(this);
							$this.find('.url, .link-text').val('');
							$this.find('.link-target').iCheck('uncheck');
						},
						buttons: {
							Insert: function (e) {
								var $this = $(this),
									target = $this.find('.link-target').is(':checked') ? '_blank' : '_self',
									url = $this.find('.url').val(),
									text = $this.find('.link-text').val(),
									insertToField = '<a href="' + url + '" target="' + target + '">' + text + '</a>',
									selectedTextReg = new RegExp(selectedText.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i');

								if(selectedText && cellText && selectedTextReg.test(cellText)) {
									insertToField = cellText.replace(selectedText, '<a href="' + url + '" target="' + target + '">' + text + '</a>');
								}
								editor.setDataAtCell(
									selection.highlight.row,
									selection.highlight.col,
									insertToField
								);
								$this.dialog('close');
							},
							Cancel: function (e) {
								$(this).dialog('close');
							}
						}
					});
			}
		},
		media: function (event) {
			var self = this,
				editor = this.getEditor(),
				selection = editor.getSelectedRange(),
				highlighted = selection === undefined ? { col: 0, row: 0 } : selection.highlight,
				url;

			if (event.ctrlKey) {
				url = prompt('Enter URL of image file:', 'http://');

				if (null === url) {
					return;
				}
				this.getEditor().setDataAtCell(highlighted.row, highlighted.col, this.getHtmlForAttachment({ url: url, type: 'image' }));
				return;
			}
			_custom_media = true;
			wp.media.editor.send.attachment = function(props, attachment) {
				if( _custom_media ) {
					editor.setDataAtCell(highlighted.row, highlighted.col, self.getHtmlForAttachment({
						url: attachment.url,
						type: attachment.type
					}, props, attachment));
				} else {
					return _orig_send_attachment.apply( this, [props, attachment] );
				}
			};
			wp.media.editor.open();
			return false;
		},
		addEditComment: function () {
			var e = this.getEditor(),
				coords = e.getSelectedRange(),
				comments = e.getPlugin('comments');

			if (coords) {
				e.deselectCell();
				comments.contextMenuEvent = true;
				comments.setRange({ from: coords.from });
				comments.show();
				comments.editor.focus();
			}
		},
		removeComment: function () {
			var e = this.getEditor(),
				comments = e.getPlugin('comments'),
				selection = this.getValidRange(e.getSelectedRange());

			if (selection) {
				comments.contextMenuEvent = true;
				comments.removeCommentAtCell(selection.from.row, selection.from.col);
			}
		},
		merge: function () {
			var e = this.getEditor();
			e.mergeCells.mergeOrUnmergeSelection(e.getSelectedRange());
			e.render();
		},
		'word-wrap-default': function() {
			this.replaceClass('', ['ww-v', 'ww-h']);
			this.getEditor().render();
		},
		'word-wrap-visible': function() {
			this.replaceClass('ww-v', ['ww-v', 'ww-h']);
			this.getEditor().render();
		},
		'word-wrap-hidden': function() {
			this.replaceClass('ww-h', ['ww-v', 'ww-h']);
			this.getEditor().render();
		},
		setFormat: function(event) {
			var formatType = $(event.target).data('type'),
				format = $(event.target).attr('data-format');

			this.setFormat(formatType, format);
			this.getEditor().render();
		},
		addHiddenCell: function() {
			this.replaceClass('hiddenCell', ['hiddenCell', 'invisibleCell']);
			this.getEditor().render();
		},
		removeHiddenCell: function() {
			this.removeClass('hiddenCell');
			this.getEditor().render();
		},
		addInvisibleCell: function() {
			this.replaceClass('invisibleCell', ['invisibleCell', 'hiddenCell']);
			this.getEditor().render();
		},
		removeInvisibleCell: function() {
			this.removeClass('invisibleCell');
			this.getEditor().render();
		},
		redo: function() {
			this.getEditor().redo();
		},
		undo: function() {
			this.getEditor().undo();
		},
		addUnescapeHtml: function() {
			this.replaceClass('unescapeHTML', ['unescapeHTML']);
			this.getEditor().render();
		},
		removeUnescapeHtml: function() {
			this.removeClass('unescapeHTML');
			this.getEditor().render();
		},
		setColumnWidth: function() {
			if(app.Editor.Hot.getSelectedRange()) {
				g_stbColumnWidthDialog.dialog('open');
			} else {
				alert('You must select at least one cell in column.');
			}
		},
		setMultipleColumnsSorting: function() {
			if(app.Editor.Hot.getSelectedRange()) {
				g_stbMultipleColumnsSortingDialog.dialog('open');
			} else {
				alert('You must select at least one cell in column.');
			}
		},
		addContactFormBtn: function() {
			if(app.Editor.Hot.getSelectedRange()) {
				g_stbAddContactFormBtnDialog.dialog('open');
			} else {
				alert('You must select at least one cell in column.');
			}
		}
	};

	// Toolbar Class
    var Toolbar = (function () {
        function Toolbar(toolbarId, editor) {
            var $container = $(toolbarId);

            this.getContainer = function () {
                return $container;
            };

            this.getEditor = function () {
                return editor;
            };
        }
		Toolbar.prototype.getFormatClasses = function () {
			return formatClasses;
		};
		Toolbar.prototype.getSvlFormatClass = function () {
			return svlFormatsClass;
		};
        Toolbar.prototype.getValidRange = function (range) {
            if (range !== undefined) {
				var startRow = range.from.row,
					endRow = range.to.row,
					startCol = range.from.col,
					endCol = range.to.col;

				if (startRow > endRow) {
					startRow = range.to.row;
					endRow = range.from.row;
				}
				if (startCol > endCol) {
					startCol = range.to.col;
					endCol = range.from.col;
				}
				range.from = {
					col: startCol,
					row: startRow
				};
				range.to = {
					col: endCol,
					row: endRow
				};
            }
			return range;
        };
        Toolbar.prototype.toggleClass = function (className) {
            var editor = this.getEditor(),
                range = this.getValidRange(editor.getSelectedRange());

            if (range === undefined) {
                return;
            }
            var classNamePattern = new RegExp(className);

            for (var row = range.from.row; row <= range.to.row; row++) {
                for (var col = range.from.col; col <= range.to.col; col++) {
                    var cell = editor.getCellMeta(row, col),
						newClassName;

                    cell.className = typeof cell.className == 'string' ? cell.className : '';

                    if (cell.className.match(classNamePattern)) {
                        newClassName = cell.className.replace(className, '');
                    } else {
                        newClassName =  cell.className + ' ' + className;
                    }
                    editor.setCellMeta(row, col, 'className', newClassName);
                }
            }
        };
		Toolbar.prototype.renderTooltips = function(row, col) {
			var countRows = this.getEditor().countRows(),
				countCols = this.getEditor().countCols();

			for (var i = row; i < countRows; i++) {
				for (var j = col; j < countCols; j++) {
					this.setTooltip(i, j);
				}
			}
		};
		Toolbar.prototype.setTooltip = function(row, col) {
			var editor = this.getEditor(),
				cell = $(editor.table).find('tbody tr').eq(row).find('td').eq(col),
				meta = editor.getCellMeta(row, col),
				dataFormats = ('data-formats' in meta ? meta['data-formats'] : '');

			if(dataFormats.length > 0)
			{
				var formats = dataFormats.split(' '),
					title = '',
					n = 1;

				for (var i = 0; i < formats.length; i++) {
					var className = formats[i];
					if (className in formatClasses) {
						var o = $('[data-toolbar="\\#toolbar-' + formatClasses[className][1] + '"]');
						title += (n++) + '. ' + o.html() + formatClasses[className][0] + '<br>';
					}
				}
				$(cell).tooltip({
					trigger: 'hover',
					html: true,
					placement: 'auto',
					container: 'body',
					title: title,
					template: '<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner" style="text-align:left"></div></div>'
				});
				$(cell).attr('title', title).tooltip('fixTitle').tooltip('setContent');
			} else {
				if($(cell).attr('data-original-title') != undefined) {
					$(cell).tooltip('destroy');
				}
			}
		};
        Toolbar.prototype.replaceClass = function (className, replace, highlight) {
            var editor = this.getEditor(),
				range = this.getValidRange(editor.getSelectedRange()),
				replPattern;

			if (range === undefined) {
                return;
            }
            if (replace instanceof RegExp) {
                replPattern = replace;
            } else if (replace instanceof Array) {
                replPattern = new RegExp(replace.join('|'));
            } else {
                replPattern = replace;
            }
			var startRow = highlight ? range.highlight.row : range.from.row,
				endRow = highlight ? range.highlight.row : range.to.row,
				startCol = highlight ? range.highlight.col : range.from.col,
				endCol = highlight ? range.highlight.col : range.to.col,
				isFormat = (className in formatClasses);

			for (var row = startRow; row <= endRow; row++) {
				for (var col = startCol; col <= endCol; col++) {
					var cell = editor.getCellMeta(row, col),
						newClass = className,
						cellClasses = cell.className || '';

					cellClasses = cellClasses.replace(replPattern, '').trim();

					if (isFormat) {
						if (cellClasses.indexOf(svlFormatsClass) !== -1) {
							var dataFormats = ('data-formats' in cell ? cell['data-formats'] : '');
							dataFormats = dataFormats.replace(replPattern, '').trim();
							editor.setCellMeta(row, col, 'data-formats', dataFormats + ' ' + className);
							newClass = '';
						} else {
							var curFormats = [];
							for (var c in formatClasses) {
								if (cellClasses.indexOf(c) !== -1) {
									curFormats.push(c);
								}
							}
							if (curFormats.length > 0) {
								cellClasses = cellClasses.replace(new RegExp(curFormats.join('|')), '');
								newClass = svlFormatsClass;
								editor.setCellMeta(row, col, 'data-formats', curFormats.join(' ') + ' ' + className);
							}
						}
						this.setTooltip(row, col);
					}
					if (newClass.length > 0 || !isFormat) {
						editor.setCellMeta(row, col, 'className', cellClasses + (newClass.length > 0 ? ' ' + newClass : ''));
					}
				}
			}
        };
        Toolbar.prototype.removeClass = function (className, highlight) {
            var editor = this.getEditor(),
                range = this.getValidRange(editor.getSelectedRange());

            if (range === undefined) {
                return;
            }
			var startRow = highlight ? range.highlight.row : range.from.row,
				endRow = highlight ? range.highlight.row : range.to.row,
				startCol = highlight ? range.highlight.col : range.from.col,
				endCol = highlight ? range.highlight.col : range.to.col,
				isFormat = (className in formatClasses);

			for (var row = startRow; row <= endRow; row++) {
				for (var col = startCol; col <= endCol; col++) {
					var cell = editor.getCellMeta(row, col),
						cellClasses = cell.className || '';

					cellClasses = cellClasses.replace(className, '');

					if (isFormat) {
						var dataFormats = ('data-formats' in cell ? cell['data-formats'] : '');
						if (dataFormats.length > 0) {
							dataFormats = dataFormats.replace(className, '').trim();
							var formats = dataFormats.split(' ');
							if (formats.length <= 1) {
								dataFormats = '';
								cellClasses = cellClasses.replace(svlFormatsClass, '');
								if (formats.length == 1) {
									cellClasses = cellClasses + ' ' + formats[0];
								}
							}
							editor.setCellMeta(row, col, 'data-formats', dataFormats);
							this.setTooltip(row, col);
						} else {
							cellClasses = cellClasses.replace(svlFormatsClass, '');
						}
					}
					editor.setCellMeta(row, col, 'className', cellClasses);
				}
			}
        };
		Toolbar.prototype.getSelectedText = function(element) {
			var txtarea = element;
			var text = '';

			if(txtarea) {
				var start = txtarea.selectionStart;
				var finish = txtarea.selectionEnd;
				text = txtarea.value.substring(start, finish);
			}

			return text;
		};
		Toolbar.prototype.getHtmlForAttachment = function(data, props, attachment) {
			var content = data.url,
				url = data.url,
				fullUrl = data.url,
				type = data.type,
				link = '',
				linkHtml = '',
				classes = 'stbSkipLazy',	// our custom class to skip lazy loading of images by Jetpack
				attrs = 'style="max-width: 100%; height: auto;"',
				isEmbed = false;

			if(props && attachment) {
				if (attachment.sizes) {
					if (attachment.sizes[props.size]) {
						url = attachment.sizes[props.size].url;
						classes += ' align' + props.align + ' size-' + props.size;
					}
					if (attachment.sizes['full']) {
						fullUrl = attachment.sizes['full'].url;
					}
				}
				if (type == 'image') {
					attrs = 'width="' + attachment.sizes[props.size].width + '" height="' + attachment.sizes[props.size].width + '"';
				}
				switch(props.link) {
					case 'file':
						link = attachment.url;
						linkHtml = '<a href="'+link+'">'+attachment.title+'</a>';
						break;
					case 'post':
						link = attachment.link;
						linkHtml = '<a href="'+link+'">'+attachment.title+'</a>';
						break;
					case 'custom':
						link = props.linkUrl;
						break;
					case 'embed':
						isEmbed = true;
						break;
					default:
						break;
				}
			}
			switch(type) {
				case 'image':
					content = '<img src="' + url + '" class="' + classes + '" ' + attrs + ' data-full="' + fullUrl + '" />';
					if(link) {
						content = '<a href="' + link + '">' + content + '</a>';
					}
					break;
				case 'video':
					if(isEmbed) {
						content = '<div class="video-container"><video controls>';
						content += '<source src="' + url + '" ' +
						(typeof attachment.mime != 'undefined' ? 'type="' + attachment.mime + '"' : '') + '>';
						content += '</video></div>';
					} else if(linkHtml) {
						content = linkHtml;
					}
					break;
				case 'audio':
					if(isEmbed) {
						content = '<div class="audio-container"><audio controls>';
						content += '<source src="' + url + '" ' +
						(typeof attachment.mime != 'undefined' ? 'type="' + attachment.mime + '"' : '') + '>';
						content += '</audio></div>';
					} else if(linkHtml) {
						content = linkHtml;
					}
					break;
				case 'application':
					if(linkHtml) {
						content = linkHtml;
					}
					break;
				default:
					break;
			}

			return content;
		};
        Toolbar.prototype.setFormat = function (formatType, format) {
			var tablesModel = app.Models.Tables,
				editor = this.getEditor(),
                range = this.getValidRange(editor.getSelectedRange());

            if (range === undefined) {
                return;
            }
            for (var row = range.from.row; row <= range.to.row; row++) {
                for (var col = range.from.col; col <= range.to.col; col++) {
                    var cell = editor.getCellMeta(row, col),
						data = editor.getDataAtCell(row, col),
						cellType = !cell.type || cell.type != 'dropdown' ? 'text' : cell.type,
						cellFormat = format || '',
						cellFormatType = formatType;

					delete cell.renderer;
					delete cell.editor;
					delete cell.validator;

					// Fix cell value if we switch cell type from Percent to Another One
					if (formatType != 'percent' && cell.formatType == 'percent') {
						if (!tablesModel.isFormula(data)) {
							data = data * 100;
						}
					}
					switch(formatType) {
						case 'currency':
							cell.renderer = tablesModel.getDefaultRenderer();
							cellFormat = format.replace(editor.currencySymbol, '$');
							break;
						case 'percent':
							cell.renderer = tablesModel.getDefaultRenderer();

							if (!tablesModel.isFormula(data)) {
								data = String(data).replace(/[^\d.-]/g, '');
							}
							break;
						case 'percent-convert':
							cell.renderer = tablesModel.getDefaultRenderer();

							if (!tablesModel.isFormula(data)) {
								data = String(data).replace(/[^\d.-]/g, '');

								// Fix cell value for Percent format
								if (cell.formatType !== 'percent') {
									data = data / 100;
								}
							}
							cellFormatType = 'percent';
							break;
						case 'date':
							cellType = 'date';
							cell.dateFormat = format;
							cell.correctFormat =  true;

							var newDate = moment(data, format);

							if (newDate.isValid()) {
								data = newDate.format(format);
							}
							break;
						case 'time_duration':
							var newTime = moment(data, format);

							if (newTime.isValid()) {
								data = newTime.format(format);
							} else {
								newTime = moment.duration(data);
								if (newTime._milliseconds || data == 0) {
									data = newTime.format(format);
								}
							}
							break;
						default:
							cell.renderer = tablesModel.getDefaultRenderer();
							break;
					}

					cell.type = cellType;
					cell.format = cellFormat;
					cell.formatType = cellFormatType;

					editor.validateCell(data, cell, function() {}, 'validateCells');
					editor.setDataAtCell(row, col, data);
                }
            }
        };
		// Apply methods to its buttons / elements
        Toolbar.prototype.subscribe = function () {
            var self = this;

			// Set methods
            this.getContainer().find('button, .toolbar-content > a, .tool').each(function () {
                var $button = $(this);

                if ($button.data('method') !== undefined && methods[$button.data('method')] !== undefined) {
                    var method = $button.data('method'),
						event = $button.data('event') || 'click';

                    $button.unbind(event);
                    $button.on(event, function (e) {
                        e.preventDefault();
                        g_stbIsDataEdited['data'] = true;

                        if (/word-wrap-default|word-wrap-visible|word-wrap-hidden/.test(method)) {
                            $('#toolbar-word-wrapping i')
                            .removeClass('word-wrap-visible word-wrap-hidden')
                            .addClass(method);
                        }
                        if (method == 'setFormat') {
							$('.cell-format').removeClass('active');
							$('.' + $button.data('type') + '-format').addClass('active');
						}
                        methods[method].apply(self, [e]);
                        // Close toolbar
                        $('body').trigger('click');
                    });
                }

            });
			// Text color colorpicker
            var $textColor = $('#textColor').ColorPicker({
                onChange: function (hsb, hex, rgb) {
					g_stbCellTxtColorLast = hex;

					if(!g_stbCellTxtColorTimeoutSet) {
						setTimeout(function(){
							g_stbCellTxtColorTimeoutSet = false;
							self.call('color', g_stbCellTxtColorLast);
						}, 500);
						g_stbCellTxtColorTimeoutSet = true;
					}
                }
            });
			// Background color colorpicker
            var $bgColor = $('#bgColor').ColorPicker({
                onChange: function (hsb, hex, rgb) {
					g_stbCellBgColorLast = hex;

					if(!g_stbCellBgColorTimeoutSet) {
						setTimeout(function(){
							g_stbCellBgColorTimeoutSet = false;
							self.call('background', g_stbCellBgColorLast);
						}, 500);
						g_stbCellBgColorTimeoutSet = true;
					}
                }
            });
			// Change cells params via its classes
            self.getEditor().addHook('afterSelection', function (startRow, startCol, endRow, endCol) {
                var cell = self.getEditor().getCell(startRow, startCol);

				if (!cell) {
					return;
				}
                var cellMeta = self.getEditor().getCellMeta(startRow, startCol),
					classes = app.getClassesRegexp(),
                    color = classes.color.exec(cell.className),
                    background = classes.background.exec(cell.className),
                    size = classes.fontSize.exec(cell.className),
					alignment = $('#toolbar-word-wrapping i'),
					format = cellMeta.formatType || 'text';

				// Cell style params
                if (null !== color) {
                    $textColor.css({borderBottomColor: '#'+color[1]});
					$('#textColor').ColorPickerSetColor('#'+color[1]);
                } else {
                    $textColor.css({borderBottomColor: '#000000'});
					$('#textColor').ColorPickerSetColor('#000000');
                }
                if (null !== background) {
                    $bgColor.css({borderBottomColor: '#'+background[1]});
					$('#bgColor').ColorPickerSetColor('#'+background[1]);
                } else {
                    $bgColor.css({borderBottomColor: '#ffffff'});
					$('#bgColor').ColorPickerSetColor('#ffffff');
                }
				if (null !== size) {
					$('#fontSize').val(size[1]);
				} else {
					$('#fontSize').val('default');
				}
				//Cell alignment
				alignment.removeClass('word-wrap-visible word-wrap-hidden');
				if (/ww-v|ww-h/.test(cell.className)) {
					if (/ww-v/.test(cell.className)) {
						alignment.addClass('word-wrap-visible');
					}
					else if (/ww-h/.test(cell.className)) {
						alignment.addClass('word-wrap-hidden');
					}
				}
				// Cell format
				$('.cell-format').removeClass('active');
                $('.' + format + '-format').addClass('active');
            });

            this.getContainer().find('button').each(function () {
                var $button = $(this),
					contentId = $button.data('toolbar');

                if (contentId !== undefined && $(contentId).length) {
                    $button.toolbar({
                        content: contentId,
                        position: 'bottom',
                        hideOnClick: true,
                        style: $button.data('style') || null
                    });
                }
            });
        };
		Toolbar.prototype.getCellsClassNames = function() {
			var editor = this.getEditor(),
				range = this.getValidRange(editor.getSelectedRange()),
				classNames = [];

			if (range === undefined) {
				return;
			}
			for (var row = 0; row <= range.to.row; row++) {
				for (var col = 0; col <= range.to.col; col++) {
					var cell = editor.getCellMeta(row, col),
						className = cell.className || '';

					if(row >= range.from.row) {
						classNames[row] = classNames[row] ? classNames[row] : [];
						classNames[row][col] = className;
						if(col < range.from.col) {
							delete classNames[row][col];
						}
					}
				}
			}
			return classNames;
		};
        Toolbar.prototype.call = function (method) {
            if (methods[method] === undefined) {
                throw new Error('The method "' + method + '" is not exists.');
            }

            methods[method].apply(this, Array.prototype.slice.call(arguments, 1, arguments.length));
        };
        Toolbar.prototype.addMethod = function (name, fn) {
            methods[name] = fn;
        };
        Toolbar.prototype.getMethods = function () {
            return methods;
        };

        return Toolbar;
    })();

    app.Editor = app.Editor || {};
    app.Editor.Toolbar = Toolbar;

}(window.jQuery, window.supsystic.Tables || {}));

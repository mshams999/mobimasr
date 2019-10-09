var g_stbWindowHeight = 0;
var g_stbPagination = false;
var g_stbRowsPerPage = 1;
var g_stbIsDataEdited = {'settings': false, 'source': false, 'history': false, 'woocommerce': false, 'data': false};
(function ($, app, undefined) {
	$(document).ready(function() {
		g_stbWindowHeight = $(window).width() > 810 ? $(window).height() * 0.7 : $(window).height();	// 810px is mobile responsive width

		var pagination = $('#tableEditor').data('editor-pagination');
		if(typeof(pagination) != 'undefined' && pagination == 'on') {
			g_stbPagination = true;
			var rowsPerPage = $('#tableEditor').data('editor-pagination-rows');
			if(typeof(rowsPerPage) != 'undefined') {
				g_stbRowsPerPage = rowsPerPage;
			}
		}

		var tableId = app.getParameterByName('id'),
			tablesModel = app.Models.Tables,
			editor = new Handsontable(document.getElementById('tableEditor'), {
				height: g_stbWindowHeight,
				renderAllRows: g_stbPagination,		// To prevent losing of rows for huge tables (need to check in future is it all right now?)
				colWidths: 100,
				rowHeaders: true,
				colHeaders: true,
				fixedRowsTop: 0,
				fixedColumnsLeft: 0,
				comments: true,
				contextMenu: {
					callback: function (key, selection, clickEvent) {
						g_stbIsDataEdited['data'] = true;
					}
				},
				formulas: true,
				/*fillHandle: {
					autoInsertRow: false		// Disable adding of new row during drag-down cell via right bottom corner
				},*/
				manualRowResize: true,
				manualColumnResize: true,
				manualRowMove: true,
				manualColumnMove: true,
				mergeCells: true,
				outsideClickDeselects: false,
				undo: true,
				renderer: tablesModel.getDefaultRenderer(),
				startCols: app.getParameterByName('cols') || 5,
				startRows: app.getParameterByName('rows') || 5,
				currentRowClassName: 'current',
				currentColClassName: 'current'
			}),
			toolbar = new app.Editor.Toolbar('#tableToolbar', editor),
			formula = new app.Editor._Formula(editor);

		window.editor = editor;
		app.Editor.Hot = editor;
		app.Editor.Tb = toolbar;

		toolbar.subscribe();
		formula.subscribe();

		// Custom Handsontabe Renderer
		Handsontable.renderers.DefaultRenderer = function(instance,td,row,col,prop,value,cellProperties) {
			value = Handsontable.TextCell.renderer.call(this,instance,td,row,col,prop,value,cellProperties);

			if(cellProperties && cellProperties.formatType == 'currency') {
				value = tablesModel.setCellFormat(value,'currency');
			} else if(cellProperties && cellProperties.formatType == 'percent') {
				value = tablesModel.setCellFormat(value,'percent');
			} else if(instance.useNumberFormat && (app.isNumber(value) || cellProperties.formatType == 'number')) {
				value = tablesModel.setCellFormat(value,'number');
			}
			Handsontable.TextCell.renderer.call(this,instance,td,row,col,prop,value,cellProperties);
		};
		Handsontable.editors.TextEditor.prototype.focus = function() {
			this.TEXTAREA.select();
		};
		Handsontable.editors.TextEditor.prototype.beginEditing = function() {
			// To show percents as is if it is pure number
			var formatType = this.cellProperties.formatType || '',value = this.originalValue;

			if(app.isNumber(value) && !tablesModel.isFormula(value)) {
				if(formatType == 'percent') {
					value = (value * 100).toString();
				}
			}

			this.originalValue = value;

			Handsontable.editors.BaseEditor.prototype.beginEditing.call(this);
		};
		Handsontable.editors.TextEditor.prototype.saveValue = function(val,ctrlDown) {
			// Correct save of percent values
			var type = this.cellProperties.type || '',formatType = this.cellProperties.formatType || '',value = val[0][0];

			if(app.isNumber(value) && !tablesModel.isFormula(value)) {
				if(formatType == 'percent' && type != 'dropdown') {
					value = (value / 100).toString();
				}
			}
			if(formatType == 'time_duration') {
				var cellFormat = this.cellProperties.format || $('input[name="timeDurationFormat"]').val(),newTime = moment(value,cellFormat);

				if(newTime.isValid()) {
					value = newTime.format(cellFormat);
				} else {
					var duration = value.match(/.{1,2}/g);

					newTime = moment.duration({
						seconds: duration[2] || 0,minutes: duration[1] || 0,hours: duration[0] || 0,days: 0,weeks: 0,months: 0,years: 0
					});

					if(newTime._milliseconds || value == 0) {
						value = newTime.format(cellFormat);
					}
				}
			}

			val[0][0] = value;

			Handsontable.editors.BaseEditor.prototype.saveValue.call(this,val,ctrlDown);
		};
		Handsontable.editors.DropdownEditor.prototype.beginEditing = function() {
			// To show percents as is if it is pure number
			var formatType = this.cellProperties.formatType || '',source = this.cellProperties.source || [];

			for(var i = 0; i < source.length; i++) {
				if(app.isNumber(source[i]) && !tablesModel.isFormula(source[i])) {
					if(formatType == 'percent') {
						source[i] = (source[i] * 100).toString();
					}
				}
			}
			Handsontable.editors.BaseEditor.prototype.beginEditing.call(this);
		};

		Handsontable.editors.DropdownEditor.prototype.saveValue = function(val,ctrlDown) {
			// Correct save of percent values
			var type = this.cellProperties.type || '',formatType = this.cellProperties.formatType || '',source = this.cellProperties.source || [],value = val[0][0];

			if(app.isNumber(value) && !tablesModel.isFormula(value)) {
				if(formatType == 'percent') {
					value = (value / 100).toString();
				}
			}
			for(var i = 0; i < source.length; i++) {
				if(app.isNumber(source[i]) && !tablesModel.isFormula(source[i])) {
					if(formatType == 'percent') {
						source[i] = (source[i] / 100).toString();
					}
				}
			}
			val[0][0] = value;

			Handsontable.editors.BaseEditor.prototype.saveValue.call(this,val,ctrlDown);
		};

		// Editor Hooks
		editor.addHook('beforeCellAlignment', function (stateBefore, range, type, alignmentClass) {
			updateUndoRedoBtns();
		});
		editor.addHook('beforeFilter', function (conditionsStack) {
			// Handsontable PRO event, add just in case (UndoRedo plugin listens this event)
			updateUndoRedoBtns();
		});
		editor.addHook('afterRender', function (isForced) {
			if(isForced) $(editor.table).find('a').attr('target', "_blank");
		});
		editor.addHook('beforeChange', function (changes, source) {
			g_stbIsDataEdited['data'] = true;
			$.each(changes, function (index, changeSet) {
				var row = changeSet[0],
					col = changeSet[1],
					value = changeSet[3],
					cell = editor.getCellMeta(row, col);

				if (cell.type == 'date') {
					var newDate = moment(value, cell.format);

					if (newDate.isValid()) {
						changeSet[3] = newDate.format(cell.format);
					}
				}
			});
		});
		editor.addHook('afterChange', function (changes) {
			updateUndoRedoBtns();

			if (!$.isArray(changes) || !changes.length) {
				return;
			}
			$.each(changes, function (index, changeSet) {
				var row = changeSet[0],
					col = changeSet[1],
					value = changeSet[3];

				if (value && value.toString().match(/\\/)) {
					editor.setDataAtCell(row, col, value.replace(/\\/g, '&#92;'));
				}
			});
			editor.render();
		});
		editor.addHook('afterLoadData', function () {
			generateWidthData();
			generateHeightData();
		});
		editor.addHook('afterCreateRow', function(insertRowIndex, amount, source) {
			var selectedCell = editor.getSelected(),
				selectedRowIndex = 0;
			if (selectedCell && selectedCell[0] && selectedCell[2]) {
				var isMin = (selectedCell[0] <= selectedCell[2] ? 0 : 2);
				if (insertRowIndex == selectedCell[isMin]) {
					selectedRowIndex = selectedCell[isMin];
				} else {
					selectedRowIndex = selectedCell[(isMin == 0 ? 2 : 0)];
				}
			}
			var i = (insertRowIndex <= selectedRowIndex ? insertRowIndex + amount : selectedRowIndex),
				data = editor.getData();

			setTimeout(function() {
				for(var j = 0; j < data[insertRowIndex].length; j++) {
					for(var n = 0; n < amount; n++) {
						editor.setCellMetaObject(insertRowIndex + n, j, editor.getCellMeta(i, j));
					}
				}
				if (amount > 1) {
					var merge = editor.mergeCells.mergedCellInfoCollection;
					for (var c = 0; c < merge.length; c++) {
						if (merge[c].row >= insertRowIndex) {
							merge[c].row += amount - 1;
						}
					}
				}
				if (g_stbPagination) {
					var rowForBuffer = editor.pageStart + insertRowIndex,
						countCols = editor.bufferCols,
						meta = editor.bufferMeta,
						merge = editor.bufferMerge;

					updateFormulas(editor.pageStop + 1, 0, 'down', amount);

					for(var n = 0; n < amount; n++) {
						editor.bufferData.splice(rowForBuffer + n, 0, data[i]);
						editor.bufferHeights.splice(rowForBuffer + n, 0, editor.allHeights[i]);
						for (var j = 0; j < countCols; j++) {
							meta.splice(rowForBuffer * countCols + j, 0, {});
						}
					}
					for (var c = 0; c < merge.length; c++) {
						if (merge[c].row >= rowForBuffer) {
							merge[c].row += amount;
						}
					}
					editor.generatePagingLinks();
					editor.setPageData();
				} else {
					toolbar.renderTooltips(insertRowIndex, 0);
					editor.render();
				}
			}, 10);
			generateHeightData();
			for(var n = 0; n < amount; n++) {
				editor.allHeights.splice(insertRowIndex + n, 0, editor.allHeights[selectedRowIndex]);
			}
			updateUndoRedoBtns();
		});
		editor.addHook('afterCreateCol', function(insertColumnIndex, amount, source) {
			insertColumnIndex = typeof(insertColumnIndex) != 'undefined' ? insertColumnIndex : 0;

			var selectedCell = editor.getSelected(),
				selectedColumnIndex = 0;

			if (selectedCell && selectedCell[1] && selectedCell[3]) {
				var isMin = (selectedCell[1] <= selectedCell[3] ? 1 : 3);
				if (insertColumnIndex == selectedCell[isMin]) {
					selectedColumnIndex = selectedCell[isMin];
				} else {
					selectedColumnIndex = selectedCell[(isMin == 1 ? 3 : 1)];
				}
			}
			var j = (insertColumnIndex <= selectedColumnIndex ? insertColumnIndex + amount : selectedColumnIndex);
			setTimeout(function() {
				var countRows = editor.getData().length;
				for(var i = 0; i < countRows; i++) {
					for(var n = 0; n < amount; n++) {
						editor.setCellMetaObject(i, insertColumnIndex + n, editor.getCellMeta(i, j));
					}
				}
				if (amount > 1) {
					var merge = editor.mergeCells.mergedCellInfoCollection;
					for (var i = 0; i < merge.length; i++) {
						if (merge[i].col >= insertColumnIndex) {
							merge[i].col += amount - 1;
						}
					}
				}

				if (g_stbPagination) {
					var countCols = editor.bufferCols,
						data = editor.bufferData,
						meta = editor.bufferMeta,
						merge = editor.bufferMerge;

					updateFormulas(0, insertColumnIndex, 'right', amount);

					for (var i = data.length - 1; i >= 0; i--) {
						for (var n = 0; n < amount; n++) {
							data[i].splice(insertColumnIndex + n, 0, '');
							meta.splice(i * countCols + insertColumnIndex + n, 0, $.extend(true, {}, meta[i * countCols + selectedColumnIndex]));
						}
					}
					for (var i = 0; i < merge.length; i++) {
						if (merge[i].col >= insertColumnIndex) {
							merge[i].col += amount;
						}
					}
					editor.bufferCols += amount;
				}
				toolbar.renderTooltips(0, insertColumnIndex);
				editor.render();
			}, 10);
			generateWidthData();
			for(var n = 0; n < amount; n++) {
				editor.allWidths.splice(insertColumnIndex + n, 0, editor.allWidths[selectedColumnIndex]);
			}
			updateUndoRedoBtns();
		});
		editor.addHook('beforeRemoveRow', function (from, amount) {
			var merge = editor.mergeCells.mergedCellInfoCollection,
				to = from + amount - 1,
				cntMerge = merge.length;
			for (var i = cntMerge - 1; i >= 0; i--) {
				var row = merge[i].row;
				if (row >= from) {
					if (row <= to) {
						merge.splice(i, 1);
					} else {
						merge[i].row -= (amount - 1);
					}
				}
			}
		});
		editor.addHook('afterRemoveRow', function (from, amount) {
			generateHeightData();
			editor.allHeights.splice(from, amount);

			if (g_stbPagination) {
				var rowForBuffer = editor.pageStart + from,
					rowForBufferAfter = rowForBuffer + amount,
					countCols = editor.bufferCols,
					merge = editor.bufferMerge,
					mergeNew = [];

				updateFormulas(editor.pageStop + 1, 0, 'up', amount);

				editor.bufferData.splice(rowForBuffer, amount);
				editor.bufferHeights.splice(rowForBuffer, amount);
				editor.bufferMeta.splice(rowForBuffer * countCols, amount * countCols);
				editor.pageStop -= amount;

				for (var i = 0; i < merge.length; i++) {
					var row = merge[i].row;
					if (row < rowForBuffer) {
						mergeNew.push(merge[i]);
					} else if (row >= rowForBufferAfter) {
						mergeNew.push({
							col: merge[i].col,
							colspan: merge[i].colspan,
							row: row - amount,
							rowspan: merge[i].rowspan
						});
					}
				}
				editor.bufferMerge = mergeNew;
			} else {
				var countRows = editor.countRows(),
					plugin = editor.getPlugin('ManualRowResize');

				for (var i = 0; i < countRows; i++) {
					var colHeight = editor.getRowHeight(i);

					if (colHeight !== editor.allHeights[i]) {
						plugin.setManualSize(i, editor.allHeights[i]);
					}
				}
			}
			setTimeout(function() {		
				if (g_stbPagination) {
					editor.generatePagingLinks();
					editor.setPageData();
				} else {
					toolbar.renderTooltips(from, 0);
				}
			}, 10);
			updateUndoRedoBtns();
		});
		editor.addHook('beforeRemoveCol', function (from, amount) {
			var merge = editor.mergeCells.mergedCellInfoCollection,
				to = from + amount - 1,
				cntMerge = merge.length;
			for (var i = cntMerge - 1; i >= 0; i--) {
				var col = merge[i].col;
				if (col >= from) {
					if (col <= to) {
						merge.splice(i, 1);
					} else {
						merge[i].col -= (amount - 1);
					}
				}
			}
		});
		editor.addHook('afterRemoveCol', function(from, amount) {
			generateWidthData();
			editor.allWidths.splice(from, amount);

			var countCols = editor.countCols(),
				plugin = editor.getPlugin('ManualColumnResize');

			for (var i = 0; i < countCols; i++) {
				var colWidth = editor.getColWidth(i);
				if (colWidth !== editor.allWidths[i]) {
					plugin.setManualSize(i, editor.allWidths[i]);
				}
			}

			if (g_stbPagination) {
				var colAfter = from + amount,
					countCols = editor.bufferCols,
					data = editor.bufferData,
					meta = editor.bufferMeta,
					merge = editor.bufferMerge,
					mergeNew = [],
					mergeCur = [];

				updateFormulas(0, colAfter, 'left', amount);

				for (var i = data.length - 1; i >= 0; i--) {
					data[i].splice(from, amount);
					meta.splice(i * countCols + from, amount);
				}

				countCols -= amount;
				for (var i = 0; i < merge.length; i++) {
					var col = merge[i].col;
					if (col < from || col >= colAfter) {
						var lastCol = col + merge[i].colspan - 1,
							colspan = (lastCol >= countCols ? countCols - 1 : lastCol) - col + 1;

						if (colspan > 1 || (colspan == 1 && merge[i].rowspan > 1)) {
							var mergeObj = {
								col: (col < from ? col : col - amount),
								colspan: colspan,
								row: merge[i].row,
								rowspan: merge[i].rowspan
							}
							mergeNew.push(mergeObj);
							if (merge[i].row >= editor.pageStart && merge[i].row <= editor.pageStop) {
								mergeCur.push(mergeObj);
							}
						}
					}
				}
				editor.bufferMerge = mergeNew;
				editor.bufferCols -= amount;
				editor.updateSettings({
					mergeCells: mergeCur
				});

				setTimeout(function() {
					editor.setPageData();
				}, 10);
			} else {
				setTimeout(function() {
					toolbar.renderTooltips(0, from);
				}, 10);
			}
			updateUndoRedoBtns();
		});
		editor.addHook('afterRowResize', function(row, height) {
			generateHeightData();
			editor.allHeights.splice(row, 1, height);
		});
		editor.addHook('afterColumnResize', function(column, width) {
			generateWidthData();
			editor.allWidths.splice(column, 1, width);
		});
		editor.addHook('afterRowMove', function (rows, target) {
			editor.render();
		});
		editor.addHook('afterColumnMove', function (columns, target) {
			editor.render();
		});
		editor.addHook('afterCopy', function (changes, copyCoords) {
			collectCellsMetaData(changes, copyCoords);
		});
		editor.addHook('afterCut', function (changes, cutCoords) {
			collectCellsMetaData(changes, cutCoords);
		});
		editor.addHook('afterPaste', function (changes, pasteCoords) {
			var rowsCopyCount = pasteCoords[0].startRow + g_stbCopyPasteRowsCount - 1,
				colsCopyCount = pasteCoords[0].startCol + g_stbCopyPasteColsCount - 1,
				endRow = pasteCoords[0].endRow < rowsCopyCount ? rowsCopyCount : pasteCoords[0].endRow,
				endCol = pasteCoords[0].endCol < colsCopyCount ? colsCopyCount : pasteCoords[0].endCol,
				j = 0;

			for(var i = 0; i < pasteCoords.length; i++) {
				for(var row = pasteCoords[i].startRow; row <= endRow; row++) {
					for(var col = pasteCoords[i].startCol; col <= endCol; col++) {
						if(!g_stbCopyPasteCellsMetaData[j]) {
							j = 0;
						}
						if(g_stbCopyPasteCellsMetaData[j]) {
							var value = editor.getDataAtCell(row, col);

							if(value && value[0] == '=') {
								var deltaRow = row - g_stbCopyPasteCellsMetaData[j].row,
									deltaCol = col - g_stbCopyPasteCellsMetaData[j].col,
									direction;

								if(deltaRow) {
									direction = deltaRow > 0 ? 'down' : 'up';
									value = editor.plugin.utils.updateFormula(value, direction, Math.abs(deltaRow));
								}
								if(deltaCol) {
									direction = deltaCol > 0 ? 'right' : 'left';
									value = editor.plugin.utils.updateFormula(value, direction, Math.abs(deltaCol));
								}
							}
							editor.setDataAtCell(row, col, value);
							editor.setCellMetaObject(row, col, g_stbCopyPasteCellsMetaData[j]);
							j++;
						}
					}
				}
			}
			editor.render();
		});

		// Load table data to editor
		$.when(
			tablesModel.getMeta(tableId),
			tablesModel.getCountRows(tableId)
		).done(function(metaResponse, countResponse) {
			$.when(
				tablesModel.getRows(tableId, countResponse[0].countRows)
			).done(function (rowsResponse) {
				if(countResponse[0].countRows == rowsResponse[0].rows.length) {
					tablesModel.setTableData(metaResponse, rowsResponse);
				} else {
					alert('Failed to load table data!');
				}
			}).fail(function (error) {
				alert('Failed to load table data: ' + error);
			}).always(function (response) {
				$('#loadingProgress').remove();
				if(!g_stbPagination) editor.renderWithRecalc();
				$('#buttonSave').attr('disabled', false);
				g_stbDoSaving = false;
			});
		}).fail(function (error) {
			alert('Failed to load table data: ' + error);
		});

		// Select all table cells by click on the top left corner of table editor
		$('.ht_clone_top_left_corner').on('mousedown', function(e) {
			editor.selectCell(0,0, editor.countRows() - 1, editor.countCols() - 1)
		});

		// Functions
		function generateHeightData() {
			if (!editor.allHeights) {
				editor.allHeights = typeof(editor.getSettings().rowHeights) == 'object' ? editor.getSettings().rowHeights : [];
			}
		}
		function generateWidthData() {
			if (!editor.allWidths) {
				editor.allWidths = typeof(editor.getSettings().colWidths) == 'object' ? editor.getSettings().colWidths : [];
			}
		}
		function updateUndoRedoBtns() {
			if(editor.undoRedo) {
				var undo = $('[data-method="undo"]'),
					redo = $('[data-method="redo"]');

				setTimeout(function() {
					if(editor.undoRedo.isUndoAvailable()) {
						undo.removeClass('inactive');
					} else {
						undo.addClass('inactive');
					}
					if(editor.undoRedo.isRedoAvailable()) {
						redo.removeClass('inactive');
					} else {
						redo.addClass('inactive');
					}
				}, 100);
			}
		}
		function collectCellsMetaData(changes, coords) {
			g_stbCopyPasteCellsMetaData = [];
			g_stbCopyPasteRowsCount = 0;
			g_stbCopyPasteColsCount = 0;
			for(var i = 0; i < coords.length; i++) {
				for(var row = coords[i].startRow; row <= coords[i].endRow; row++) {
					for(var col = coords[i].startCol; col <= coords[i].endCol; col++) {
						g_stbCopyPasteCellsMetaData.push(editor.getCellMeta(row,col));
						if(row == coords[i].startRow) {
							g_stbCopyPasteColsCount++;
						}
					}
					g_stbCopyPasteRowsCount++;
				}
			}
		}

		function updateFormulas(row, col, direction, amount) {
			var data = editor.bufferData,
				countCols = editor.bufferCols;

			for (var i = row; i < data.length; i++) {
				for (var j = col; j < countCols; j++) {
					if (data[i][j] && data[i][j][0] === '='){
						data[i][j] = editor.plugin.utils.updateFormula(data[i][j], direction, amount);
					}
				}
			}
		}

		editor.generatePagingLinks = (function () {
			return function () {
				var links = Math.ceil(this.bufferData.length/g_stbRowsPerPage),
					pagination = $('#pagination');

				if (pagination.length == 1) $(pagination).children('a').remove();
				else pagination = $('<div id="pagination" class="pagination"></div>').insertAfter('#tableEditor');
				for (var i = 1; i <= links; i++) {
					$('<a>').attr('href', '#' + i).text(i + ' ').appendTo('#pagination');
				}
			}
		})();

		editor.setPageData = (function () {
			return function (inBuffer) {
				if (typeof(inBuffer) == 'undefined') inBuffer = true;
				if (inBuffer) {
					this.copyInBuffer();
				}

				var page = parseInt(window.location.hash.replace('#', ''), 10) || 1,
					limit = g_stbRowsPerPage,
					countRows = this.bufferData.length,
					countCols = this.bufferCols,
					start = (page - 1) * limit;

				if (start >= countRows) {
					page = 1;
					start = 0;
				}

				var	stop = page * limit - 1,
					heights = [];
					partData = [],
					mergeCells = [],
					rowHeaders = [],
					links = $('#pagination a');


				for (var i = 0; i < links.length; i++) {
					if (i == page - 1) {
						$(links[i]).addClass('pageCur');
					} else {
						$(links[i]).removeClass();
					}
				}

				if (stop >= countRows) {
					stop = countRows - 1;
				}
				for (var row = start; row <= stop; row++) {
					partData.push(this.bufferData[row].slice());
					heights.push(this.bufferHeights[row]);
					rowHeaders.push(row + 1);
				}
				for (var m = 0; m < this.bufferMerge.length; m++) {
					var merge = this.bufferMerge[m];
					if (merge.row >= start && merge.row <= stop) {
						mergeCells.push({
							col: merge.col,
							colspan: merge.colspan,
							row: merge.row % limit,
							rowspan: merge.rowspan
						});
					}
				}
				this.updateSettings({
					rowHeights: heights,
					mergeCells: mergeCells,
					manualRowResize: false,
					rowHeaders: rowHeaders
				});
				this.pageStart = start;
				this.pageStop = stop;
				this.loadData(partData);
				this.allHeights = heights;

				var r = 0;
				for (row = start; row <= stop; row++) {
					for (var col = 0; col < countCols; col++) {
						this.setCellMetaObject(r, col, this.bufferMeta[row * countCols + col]);
						toolbar.setTooltip(r, col);
					}
					r++;
				}
				
				this.updateSettings({
					manualRowResize: true
				});
				this.renderWithRecalc();
			}
		})();

		editor.copyInBuffer = (function () {
			return function () {
				if (typeof this.pageStop == 'undefined') {
					return;
				}

				var countRows = this.countRows(),
					countCols = this.countCols(),
					start = this.pageStart,
					stop = this.pageStop,
					data = this.getData(),
					merge = this.mergeCells.mergedCellInfoCollection;
					real = 0;

				for (var row = 0; row < countRows; row++) {
					real = start + row;
					this.bufferData[real] = data[row].slice();
					this.bufferHeights[real] = this.getRowHeight(row);
					for (var col = 0; col < countCols; col++) {
						this.bufferMeta[real * countCols + col] = editor.getCellMeta(row, col);
					}
				}

				var mergeNew = [],
					realCountRows = this.bufferData.length;
					
				for (var i = 0; i < merge.length; i++) {
					mergeNew.push({
						col: merge[i].col,
						colspan: merge[i].colspan,
						row: start + merge[i].row,
						rowspan: merge[i].rowspan
					});
				}
				for (var i = 0; i < this.bufferMerge.length; i++) {
					row = this.bufferMerge[i].row;
					if (row < realCountRows && (row < start || row > stop)) {
						mergeNew.push(this.bufferMerge[i]);
					}
				}
				this.bufferMerge = mergeNew;
			}
 		})();

		editor.mergeGetInfo = (function () {
			return function (x, y) {
				var merge = this.bufferMerge;

				for (var n = 0, o = this.bufferMerge.length; n < o; n++) {
					if (merge[n].row <= x && merge[n].row + merge[n].rowspan - 1 >= x && merge[n].col <= y && merge[n].col + merge[n].colspan - 1 >= y) {
						return merge[n];
					}
				}
			}
		})();

		editor.getCellValuePagination = (function () {
			return function (row, col) {
				return row >= this.pageStart && row <= this.pageStop ? this.getData()[row][col] : this.bufferData[row][col];
			}
		})();

		editor.getSourceDataPagination = (function () {
			return function (fromX, fromY, toX, toY) {
				this.copyInBuffer();
				if (typeof(fromX) == 'undefined') return this.bufferData;
				var data = this.bufferData,
					rangeData = [],
					buffer;

				if (fromX > toX) {
					buffer = fromX;
					fromX = toX;
					toX = buffer;
				}
				if (fromY > toY) {
					buffer = fromY;
					fromY = toY;
					toY = buffer;
				}
				for (var x = fromX; x <= toX; x++) {
					var cells = [];
					for (var y = fromY; y <= toY; y++) {
						cells.push(data[x][y]);
					}
					rangeData.push(cells);
				}
				return rangeData;
			}
		})();

		editor.renderWithRecalc = (function () {
			return function () {
				var recalcLimit = 5;
				do {
					this.render();
					recalcLimit--;
				} while(this.plugin.matrix.needRecalc() && recalcLimit > 0);
			}
        })();

		Handsontable.dom.addEvent(window, 'hashchange', function (event) {
			if (g_stbPagination) {
				editor.setPageData();
			}
		});
	});
}(window.jQuery, window.supsystic.Tables));

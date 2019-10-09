var g_stbDoSaving = true; //waiting for the end of downloads
var g_stbDoPreview = false;
var g_stbNeedPreview = false;
var g_stbMobilePreview = false;
var g_stbPreviewTimeoutSet = false;
//var g_stbPreviewTable = null;
(function ($, app) {

	var TablesModel = (function () {
		function TablesModel() {
			this.getEditor = function() {
				return app.Editor.Hot;
			};
			this.getCssEditor = function() {
				return window.ace.edit("css-editor");
			};
		}
		TablesModel.prototype.request = function (action, data) {
			return app.request({
				module: 'tables',
				action: action
			}, data);
		};

		/**
		 * Sends the request to the Settings module.
		 * @param {string} action
		 * @param {object} data
		 * @returns {jQuery.Deferred.promise}
		 */
		TablesModel.prototype.settingsRequest = function (action, data) {
			return app.request({
				module: 'settings',
				action: action
			}, data);
		};

		TablesModel.prototype.renameTableRequest = function (id, title) {
			if (isNaN(id = parseInt(id))) {
				throw new Error('Invalid table id.');
			}

			return this.request('rename', { id: id, title: title });
		};

		TablesModel.prototype.getColumns = function (id) {
			if (isNaN(id = parseInt(id))) {
				throw new Error('Invalid table id.');
			}

			return this.request('getColumns', { id: id });
		};

		TablesModel.prototype.setColumns = function (id, columns) {
			if (isNaN(id = parseInt(id))) {
				throw new Error('Invalid table id.');
			}

			return this.request('updateColumns', { id: id, columns: columns })
		};

		TablesModel.prototype.getCountRows = function (id) {
			if (isNaN(id = parseInt(id))) {
				throw new Error('Invalid table id.');
			}

			return this.request('getCountRows', { id: id })
		};

		var allRows = [];
		TablesModel.prototype.getPartRows = function(id, limit, offset, deferred) {
			var self = this;
			$.when(
				this.request('getRows', { id: id, limit: limit, offset: offset})
			).done(function (rowsResponse) {
				if(rowsResponse.rows.length > 0) {
					$.merge(allRows, rowsResponse.rows);
					offset += limit;
					self.getPartRows(id, limit, offset, deferred);
				} else {
					deferred.resolve([{rows: allRows}]);
				}
			});
		};

		TablesModel.prototype.getRows = function (id) {
			if (isNaN(id = parseInt(id))) {
				throw new Error('Invalid table id.');
			}
			var deferred = $.Deferred();
				limit = 2000,
				offset = 0;

			this.getPartRows(id, limit, offset, deferred);
			return deferred.promise();
		};

		TablesModel.prototype.setRows = function (id, rows, byPart) {
			if (isNaN(id = parseInt(id))) {
				throw new Error('Invalid table id.');
			}
			byPart = typeof(byPart) != 'undefined' ? byPart : false;

			if(byPart) {
				var self = this,
					step = ((typeof app.Models.Tables.step != 'undefined') && parseInt(app.Models.Tables.step)) ? parseInt(app.Models.Tables.step) : 400,
					done = true,
					ajaxPromise = new $.Deferred().resolve(),
					rowsChunks = app._getChunksArray(rows, step),
					rowsData = [];

				for(var i = 0; i < rowsChunks.length; i++) {
					rowsData.push({
						id: id,
						step: step,
						last: i == (rowsChunks.length - 1) ? 1 : 0,
						rows: this._prepareData(rowsChunks[i]) })
				}

				$.each(rowsData, function (index, data) {
					ajaxPromise = ajaxPromise.then(function() {
						data._maxIter = 3;
						return self.request('updateRows', data);
					},function() {
						if(done) {
							done = false;
							alert('Failed to save table data: There are errors during the request');
						}
					});
				});
				ajaxPromise = ajaxPromise.then(function() {
					self.endSave();
				});
			} else {
				return this.request('updateRows', { id: id, rows: this._prepareData(rows) });
			}
		};

		TablesModel.prototype.endSave = function () {
			app.deleteSpinner($('#buttonSave'));
			g_stbDoSaving = false;
		};

		TablesModel.prototype.getMeta = function (id) {
			if (isNaN(id = parseInt(id))) {
				throw new Error('Invalid table id.');
			}

			return this.request('getMeta', { id: id });
		};

		TablesModel.prototype.setMeta = function (id, meta) {
			if (isNaN(id = parseInt(id))) {
				throw new Error('Invalid table id.');
			}

			return this.request('updateMeta', { id: id, meta: this._prepareData(meta) })
		};

		TablesModel.prototype.getSettings = function () {
			return app.request({
				module: 'settings',
				action: 'getSettings'
			}, {});
		};

		TablesModel.prototype.getTablesSettings = function () {
			return this.settingsRequest('getSettings',{});
		};

		TablesModel.prototype.setSettings = function (id, settings, source) {
			if (isNaN(id = parseInt(id))) {
				throw new Error('Invalid table id.');
			}
			var data = settings.serialize();
			if(typeof(source) != 'undefined' && source.length) {
				data += '&' + source.serialize();
			}

			return this.request('saveSettings', { id: id, settings: data });
		};

		TablesModel.prototype.setHistorySettings = function (id, settings) {
			if(SDT_DATA.isPro && settings.length) {
				if (isNaN(id = parseInt(id))) {
					throw new Error('Invalid table id.');
				}

				return this.request('saveHistorySettings', { id: id, settings: settings.serialize() });
			}
		};



		TablesModel.prototype.getDefaultRenderer = function(preview) {
			return Handsontable.renderers.DefaultRenderer;
		};

		TablesModel.prototype.setTableData = function(metaResponse, rowsResponse) {
			var self = this,
				editor = self.getEditor(),
				rows = rowsResponse[0].rows,
				meta = metaResponse[0].meta,
				comments = [],
				toolbar = app.Editor.Tb,
				svlFormatsClass = toolbar.getSvlFormatClass(),
				formatClasses = toolbar.getFormatClasses(),
				mergeCells = (typeof meta === 'object' && 'mergedCells' in meta && meta.mergedCells.length ? meta.mergedCells : []);

			// Set rows data
			if (rows.length > 0) {
				var data = [],
					cellsMeta = [],
					heights = [],
					widths = [],
					$style = app.getAdminCellStylesElem();

				$.each(rows, function (x, row) {
					var cells = [];

					heights.push(row.height !== undefined && row.height > 0 ? row.height : undefined);

					$.each(row.cells, function (y, cell) {
						var metaData = {};

						if ('meta' in cell && cell.meta !== undefined) {
							var classes = app.getClassesRegexp(),
								color = classes.color.exec(cell.meta),
								background = classes.background.exec(cell.meta),
								fontFamily = classes.fontFamily.exec(cell.meta),
								fontSize = classes.fontSize.exec(cell.meta);

							if (null !== color && $style.html().indexOf(color[0]) == -1) {
								$style.html($style.html() + ' .'+color[0]+' {color:#'+color[1]+' !important}');
							}
							if (null !== background && $style.html().indexOf(background[0]) == -1) {
								$style.html($style.html() + ' .'+background[0]+' {background-color:#'+background[1]+' !important}');
							}
							if (null !== fontFamily && $style.html().indexOf(fontFamily[0]) == -1) {
								var family = fontFamily[1].replace(/_/g, ' '),
									familyName = fontFamily[1].replace(/_/g, '+'),
									url = '';

								if(g_stbStandartFontsList
									&& toeInArray(family, g_stbStandartFontsList) == -1
									&& g_stbAllFontsList
									&& toeInArray(family, g_stbAllFontsList) != -1
								) {
									url = '@import url("//fonts.googleapis.com/css?family=' + familyName + '"); ';
								}
								$style.html(url + $style.html() + ' .'+fontFamily[0]+' {font-family:"'+family+'" !important}');
							}
							if (null !== fontSize && $style.html().indexOf(fontSize[0]) == -1) {
								var lineHeight = +fontSize[1] + 6;
								$style.html($style.html() + ' .'+fontSize[0]+' {font-size:'+fontSize[1]+'px !important; line-height:'+lineHeight+'px !important;}');
							}

							var cellClasses = cell.meta,
								curClasses = [],
								dataFormat = [];

							for (var i = 0; i <= cellClasses.length; i++) {
								if (cellClasses[i] in formatClasses) {
									dataFormat.push(cellClasses[i]);
								} else {
									curClasses.push(cellClasses[i]);
								}
							}
							if (dataFormat.length > 0) {
								if (dataFormat.length == 1) {
									curClasses.push(dataFormat[0]);
									dataFormat = '';
								} else {
									curClasses.push(svlFormatsClass);
								}
							}
							metaData = $.extend(metaData, { row: x, col: y, className: curClasses.join(' '), 'data-formats': dataFormat.length > 0 ? dataFormat.join(' ') : ''});
						}
						if (cell.formatType) {
							metaData = $.extend(metaData, {
								type: cell.type == 'numeric' ? 'text' : cell.type, // To remove numeric renderer
								format: cell.type == 'numeric' ? '' : cell.format,
								formatType: cell.type == 'numeric' ? '' : cell.formatType
							});
						} else {
							if(app.isNumber(cell.data)) {
								metaData = $.extend(metaData, {
									type: 'text',
									format: '',
									formatType: 'number'
								});
							}
						}

						if(typeof(cell.readOnly) != 'undefined' && cell.readOnly == true) {
							metaData.readOnly = true;
						}
						// selectable cell data source
						if(cell.source && cell.source.length) {
							metaData.type = cell.type;
							metaData.source = cell.source;
							metaData.baseType = cell.baseType;
						}
						switch(cell.formatType) {
							case 'date':
								//one table can contain multiple date formats
								metaData.format = cell.format;
								metaData.dateFormat = cell.format;
								metaData.correctFormat =  true;

								if(cell.reformat) {
									var newDate = moment(cell.data, cell.format);

									if (newDate.isValid()) {
										cell.data = newDate.format($('input[name="dateFormat"]').val());
									}
								}
								break;
							case 'time_duration':
								if(cell.reformat) {
									var cellFormat = $('input[name="timeDurationFormat"]').val(),
										newTime = moment(cell.data, cell.format);

									if (newTime.isValid()) {
										cell.data = newTime.format(cellFormat);
									} else {
										var duration = cell.data.match(/.{1,2}/g);

										newTime = moment.duration({
											seconds: duration[2] || 0,
											minutes: duration[1] || 0,
											hours: duration[0] || 0,
											days: 0,
											weeks: 0,
											months: 0,
											years: 0
										});

										if (newTime._milliseconds || cell.data == 0) {
											cell.data = newTime.format(cellFormat);
										}
									}
								}
								break;
							default:
								metaData.renderer = self.getDefaultRenderer();
								break;
						}
						cellsMeta.push(metaData);

						if (x === 0 && meta.columnsWidth) {
							widths.push(meta.columnsWidth[y] > 0 ? meta.columnsWidth[y] : 62);
						} else if (x === 0 ) {
							// Old
							widths.push(cell.width === undefined ? 62 : cell.width);
						}
						g_stbFixedColumnsWidth = meta.columnsFixedWidth || g_stbFixedColumnsWidth;
						g_stbMultipleColumnsSorting = meta.columnsSortOrder || g_stbMultipleColumnsSorting;
						g_stbDisableColumnsSorting = meta.columnsDisableSorting || g_stbDisableColumnsSorting;

						if (typeof(cell.comment) != 'undefined') {
							comments.push({
								col:     y,
								row:     x,
								comment: cell.comment
							});
						}
						try {
							if(cell.data[0] !== '=' && $(cell.data).is('video')) {
								cell.data = '<div class="video-container">' + cell.data + '</div>';
							}
						} catch(e) {}
						
						cells.push(cell.data);
					});
					data.push(cells);
				});

				// Load extracted data
				if (g_stbPagination) {
					if(typeof editor.bufferData == 'undefined') {
						var cols = (data.length > 0 ? data[0].length : 0);
						for (var c in comments) {
							cellsMeta[comments[c].row * cols + comments[c].col].comment = comments[c].comment;
						}
						editor.bufferCols = cols;
						editor.bufferData = data;
						editor.bufferMeta = cellsMeta;
						editor.bufferMerge = mergeCells;
						editor.bufferHeights = heights;
						editor.updateSettings({
							colWidths: widths
						});
						editor.generatePagingLinks();
					}
					editor.setPageData(false);
				} else {
					// Set merged cells
					if (mergeCells.length > 0) {
						editor.updateSettings({
							mergeCells: mergeCells
						});
					}

					// Height & width
					editor.updateSettings({
						rowHeights: heights,
						colWidths: widths
					});

					editor.loadData(data);

					// Comments. Note: comments need to be loaded after editor.loadData() call.
					if (comments.length) {
						editor.updateSettings({
							cell: comments
						});
					}

					// Load extracted metadata
					$.each(cellsMeta, function (i, meta) {
						editor.setCellMetaObject(meta.row, meta.col, meta);
						toolbar.setTooltip(meta.row, meta.col);
					});
				}
			}
		};

		TablesModel.prototype.saveTable = function(preview, rerender) {
			this._saveTable(preview, rerender);
		};

		TablesModel.prototype._saveTable = function(preview, rerender) {
			// rerender = 1 (needed render preview) 
			// rerender = 2 (needed settings save and render preview) 
			preview = typeof(preview) != 'undefined' ? preview : false;
			rerender = typeof(rerender) != 'undefined' ? rerender : false;
			var self = this,
				editor = self.getEditor(),
				id = app.getParameterByName('id'),
				toolbar = app.Editor.Tb,
				svlFormatsClass = toolbar.getSvlFormatClass(),
				formatClasses = toolbar.getFormatClasses(),
				pagination = g_stbPagination,
				lastSave = false;

			if(pagination) {
				editor.copyInBuffer();
				var bufferData = editor.bufferData,
					bufferMeta = editor.bufferMeta,
					bufferMerge = editor.bufferMerge,
					bufferHeights = editor.bufferHeights,
					countCols = editor.bufferCols;
			}

			if(preview !== false) {			
				if(g_stbDoPreview && rerender) {
					g_stbNeedPreview = true;
					return;	
				}
				for(var key in g_stbIsDataEdited) {
					if(g_stbIsDataEdited[key] && (rerender == 2 || key != 'settings')) {
						lastSave = key;
					}
				}

				var $preview = $(preview),
					$table = $preview.find('.supsystic-tables-wrap');
				if($table.length) {
					if(lastSave == false && !rerender && !g_stbNeedPreview) return;
					//g_stbPreviewTable = '';
					$table.find('.dataTables_processing').css('display', 'block');
				}
				else {
					$(preview).html($('<i/>', { class: 'fa fa-spinner fa-spin' }).attr('style','font-size: 2em !important')).prepend('<label> Table generate in process.... </label>');
				}
			} else {
				g_stbNeedPreview = true;
			}

			if(!g_stbDoSaving && (!preview || lastSave !== false)) {
				g_stbDoSaving = true;
				app.createSpinner($('#buttonSave'));

				var formData = this.prepareSettingsForm($('form#settings'), id),
					sourceData = $('form#source-settings'),
					byPart = true,
					metaData = [],
					mergeData = [],
					rowsData = [],
					columnsWidth = [],
					rowCounter = 0,
					requiredAssets = {};

				if(!preview || g_stbIsDataEdited['data']) {

					$.each((pagination ? bufferData : editor.getData()), function (x, row) {
						var currentRow = { cells: [] };
						rowCounter++;

						$.each(row, function (y, cell) {
							var meta = (pagination ? bufferMeta[x * countCols + y] : editor.getCellMeta(x, y)),
								metaClasses = meta.className;

							if (typeof(metaClasses) != 'undefined' && metaClasses.indexOf(svlFormatsClass) !== -1) {
								metaClasses = metaClasses.replace(svlFormatsClass, '').trim();
								var dataFormats = ('data-formats' in meta ? meta['data-formats'] : '');
								if (dataFormats.length > 0) {
									for (var c in formatClasses) {
										if (dataFormats.indexOf(c) !== -1) {
											metaClasses += ' ' + c;
										}
									}
								}
							}
							var cellHtml = (pagination ? bufferData[x][y] : $(editor.getCell(x, y))),
								classes = [],
								cellData = {
									y: rowCounter,
									data: cell,
									calculatedValue: null,
									hidden: false,
									hiddenCell: metaClasses && metaClasses.match('hiddenCell') !== null,
									invisibleCell: metaClasses && metaClasses.match('invisibleCell') !== null
								},
								mergeCell = (pagination ? editor.mergeGetInfo(x, y) : editor.mergeCells.mergedCellInfoCollection.getInfo(x, y));

							// set merged params
							if(mergeCell !== undefined) {
								cellData.hidden = true;
							}
							if(!pagination)
							{
								// set formatted value
								cellHtml = cellHtml.clone();
								cellHtml.find('.htAutocompleteArrow').remove();
								cellData.formattedValue = cellHtml.text().replace(/\\/g, '&#92;');
							}

							if(meta.readOnly) {
								cellData.readOnly = true;
							}
							// selectable cell data source
							if(meta.source && meta.source.length) {
								meta.type = 'dropdown';
								cellData.source = meta.source;
							}

							// Set cell format
							cellData.type = meta.type ? meta.type : 'text';
							cellData.baseType = meta.baseType ? meta.baseType : 'text';
							cellData.formatType = meta.formatType ? meta.formatType : '';

							switch(cellData.formatType) {
								case 'currency':
									cellData.format = formData.find('[name="currencyFormat"]').val();
									break;
								case 'percent':
									cellData.format = formData.find('[name="percentFormat"]').val();
									break;
								case 'date':
									//one table can contain multiple date formats
									cellData.format = meta.format != 'undefined'
										? meta.format
										: formData.find('[name="dateFormat"]').val();

									var date = moment(cellData.data, cellData.format);

									if (date.isValid()) {
										cellData.dateOrder = date.format('x');
									}
									break;
								default:
									cellData.format = meta.format;
									break;
							}

							// Set calculated value for cells with formulas
							if (self.isFormula(cell)) {
								var value = self.getFormulaResult(cell, x, y);

								if (value !== undefined) {
									if (!isNaN(value) && value !== '0' && value !== 0 && value % 1 !== 0) {	// round float
										var floatValue = parseFloat(value);

										if (floatValue.toString().indexOf('.') !== -1) {
											var afterPointSybolsLength = floatValue.toString().split('.')[1].length;

											if (afterPointSybolsLength > 4) {
												value = floatValue.toFixed(4);
											}
										}
									}
									cellData.calculatedValue = value;
									if(typeof cell == 'string' && cell.toLowerCase().indexOf('=hyperlink') === 0) {
										cellData.calculatedValue = app._hyperlinkUrl ? app._hyperlinkUrl : value;
									}
								}
							}

							// Set classes for cell
							if (metaClasses !== undefined) {
								$.each(metaClasses.split(' '), function (index, element) {
									if (element.length) {
										if(toeInArray(element, ['datefield', 'tooltipCell', 'collapsibleCell']) != -1 && !requiredAssets[element]) {
											requiredAssets[element] = true;
										}
										classes.push($.trim(element));
									}
								});
							}
							cellData.meta = classes;

							// Set comments for cell
							if (typeof(meta.comment) != 'undefined') {
								cellData.comment = meta.comment;
							}

							// Set column width by cells of first table row
							if (x == 0) {
								columnsWidth.push(editor.getColWidth(y));
							}
							var diagramsExists = cell && cell.toString().match(/(\[\s*supsystic-table-diagram[^\]]*\])+?/gi);
							
							if(diagramsExists) {
								for(var i = 0; i < diagramsExists.length; i++) {
									var diagramId = /id=[\'|\"](\d+)[\'|\"]/gi.exec(diagramsExists[i]);

									if(diagramId && diagramId[1]) {
										requiredAssets.diagrams = requiredAssets.diagrams ? requiredAssets.diagrams : [];
										requiredAssets.diagrams.push(diagramId[1]);
									}
								}
							}
							currentRow.cells.push(cellData);
						});

						// Row height
						currentRow.height = (pagination ? bufferHeights[x] : editor.getRowHeight(x));

						rowsData.push(currentRow);
					});
					if(pagination) {
						mergeData = bufferMerge;
					} else {
						if(editor.mergeCells.mergedCellInfoCollection.length) {
							for(var i = 0; i < editor.mergeCells.mergedCellInfoCollection.length; i++) {
								mergeData.push(editor.mergeCells.mergedCellInfoCollection[i]);
							}
						}
					}
					metaData = {
						requiredAssets: requiredAssets,
						mergedCells: mergeData,
						columnsWidth: columnsWidth,
						columnsFixedWidth: g_stbFixedColumnsWidth,
						columnsSortOrder: g_stbMultipleColumnsSorting,
						columnsDisableSorting: g_stbDisableColumnsSorting,
						css: this.getCssEditor().getValue()
					};
				}

				if(preview) {
					self.getPreview(id, preview);
				}

				// Request to save settings, meta and rows
				var ajaxPromise = new $.Deferred().resolve();

				if(!preview || g_stbIsDataEdited['settings'] || g_stbIsDataEdited['source']) {
					if(sourceData.length) {
						sourceData.find('input[name="source[dbSQL]"]').val(sourceData.find('#source-db-sql').val());
					}
					ajaxPromise = ajaxPromise.then(
						function() {
							return self.setSettings(id, formData, sourceData);
						}
					);
					g_stbIsDataEdited['settings'] = false;
					g_stbIsDataEdited['source'] = false;
					if(lastSave == 'settings' || lastSave == 'source') {
						ajaxPromise = ajaxPromise.then(function() {
							self.endSave();
						});
					}
				}
				if(!preview || g_stbIsDataEdited['history']) {
					ajaxPromise = ajaxPromise.then(
						function() {
							return self.setHistorySettings(id, $('form#history-settings'));
						}
					);
					g_stbIsDataEdited['history'] = false;
					if(lastSave == 'history') {
						ajaxPromise = ajaxPromise.then(function() {
							self.endSave();
						});
					}
				}
				if(!preview || g_stbIsDataEdited['woocommerce']) {
					ajaxPromise = ajaxPromise.then(
						function() {
							if(SDT_DATA.isWooPro) {
								return self.setWooSettings(id, $('form#woocommerce-settings'));
							}
						}
					);
					g_stbIsDataEdited['woocommerce'] = false;
					if(lastSave == 'woocommerce') {
						ajaxPromise = ajaxPromise.then(function() {
							self.endSave();
						});
					}
				}
				if(!preview || g_stbIsDataEdited['data']) {
					ajaxPromise = ajaxPromise.then(
						function() {
							return self.setMeta(id, metaData);
						}
					);
					ajaxPromise = ajaxPromise.then(
						function() {
							return self.setRows(id, rowsData, byPart, preview);
						}
					);
					g_stbIsDataEdited['data'] = false;
				}
			} else {
				if(preview && !g_stbPreviewTimeoutSet) {
					this.getPreview(id, preview);
				}
			}
		};

		TablesModel.prototype.getPreview = function (id, preview) {
			var self = this;

			if(g_stbDoSaving) {
				g_stbPreviewTimeoutSet = true;
				setTimeout(function() {
					self.getPreview(id, preview);
				}, 50);
			} else {
				g_stbPreviewTimeoutSet = false;
				if(!g_stbDoPreview) {
					g_stbDoPreview = true;
					g_stbNeedPreview = false;
					var container = preview instanceof $ ? preview : $(preview),
						table;

					if(container.length) {
						var settings = (g_stbIsDataEdited['settings'] ? this.prepareSettingsForm($('form#settings'), id).serialize() : '');

						return this.render(app.getParameterByName('id'), settings).done(function(response) {
							var tableInstance = app.getTableInstanceById(id);
							if(tableInstance) {
								tableInstance.api().destroy();
								app.removeTableInstanceByViewId(tableInstance.data('view-id'));
							}
							//g_stbPreviewTable = response.table;
							container.empty().append($(response.table));
							table = container.find('table');
							if(g_stbMobilePreview) {
								app.setTableMobileWidth();
							}
							app.initTablesOnPage();
							self._afterTablePreview(table);
							if(app.initExportTable) {
								app.initExportTable();
							}
						}).always(function() {
							setTimeout(function(){
								g_stbDoPreview = false;
								if(g_stbNeedPreview) {
									self.getPreview(id, preview);
								}
							}, 2000);
							
						});
					}
				}
			}
		};

		TablesModel.prototype.reinitPreview = function (preview) {
			var self = this,
				tableId = app.getParameterByName('id'),
				tableInstance = app.getTableInstanceById(tableId);
			if(tableInstance) {
				tableInstance.api().destroy();
				app.removeTableInstanceByViewId(tableInstance.data('view-id'));
			}
			//previewContainer.empty().append($(g_stbPreviewTable));
			table = preview.find('table');
			if(table.length == 0) return;

			app.setTableMobileWidth(g_stbMobilePreview);

			app.initializeTable(table, app.showTable, function(table) {
				self._afterTablePreview(table);
				if(typeof tableInstance.fnAdjustColumnSizing == 'function' ) {
					setTimeout(function(){
						tableInstance.fnAdjustColumnSizing(false);
					}, 350);
				}
				if(app.initExportTable) {
					app.initExportTable();
				}
			});
		}

		TablesModel.prototype.getCssText = function(rule) {
			var value = rule.cssText ? rule.cssText : rule.style.cssText;
			if(typeof(value) == 'undefined' || value.length == 0 || value.indexOf('@import') >= 0) return ''; 
			if(value.indexOf(rule.selectorText) == -1) {
				value = rule.selectorText + '{' + value + '}';
			}
			return value;
		}

		TablesModel.prototype.prepareSettingsForm = function(formData, id) {
			// Put textareas data into the hidden fields before the saving of table settings
			formData.find('input[name="elements[descriptionText]"]').val( formData.find('#descriptionText').val() );
			formData.find('input[name="elements[signatureText]"]').val( formData.find('#signatureText').val() );
			formData.find('input[name="features[after_table_loaded_script]"]').val(this._b64EncodeUnicode(formData.find('#after-table-loaded-script-text').val()));

			var customCss = '',
				obj = document.getElementById('stb-preview-css'),
				sheet = obj.sheet || obj.styleSheet;
			if(!sheet.disabled) {
				var rules = sheet.cssRules || sheet.rules;
				if(rules) {
					for(var r = 0; r < rules.length; r++) {
						customCss += this.getCssText(rules[r]);
					}
				}
			}
			customCss = customCss.replace(new RegExp('supsystic-table-'+id, 'g'), 'supsystic-table-{id}');
			formData.find('input[name="styles[customCss]"]').val(customCss);
			return formData;
		}

		TablesModel.prototype.disablePreviewCss = function (mode) {
			var obj = document.getElementById('stb-preview-css'),
				sheet = obj.sheet || obj.styleSheet;
			sheet.disabled = mode;
		}

		TablesModel.prototype.getFontFamily = function(family) {
			if(g_stbStandartFontsList
				&& toeInArray(family, g_stbStandartFontsList) == -1
				&& g_stbAllFontsList
				&& toeInArray(family, g_stbAllFontsList) != -1
			) {
				return '@import url("//fonts.googleapis.com/css?family=' + family.replace(/_/g, '+') + '"); ';
			}
			return '';
		}

		TablesModel.prototype.updatePreviewCss = function (selectors) {
			var obj = document.getElementById('stb-preview-css'),
				sheet = obj.sheet || obj.styleSheet,
				rules = sheet.cssRules || sheet.rules;

			for(var i = 0; i < selectors.length; i++) {
				var selector = selectors[i].selector,
					param = selectors[i].param,
					value = selectors[i].value,
					newRules = typeof(value) == 'string' && value.length ? param + ':' + (param == 'font-family' ? '"' + value + '"' : value) + ';' : '',
					found = -1;

				for(var r = 0; r < rules.length; r++) {
					if(rules[r].selectorText == selector) {
						found = r;
						var curCss = this.getCssText(rules[r]),
							curRules = curCss.substring(curCss.indexOf('{') + 1, curCss.lastIndexOf('}')).split(';');

						for(var c = 0; c < curRules.length; c++) {
							var rulePaar = curRules[c].split(':');
							if(rulePaar.length == 2) {
								if(rulePaar[0].trim() != param) {
									newRules += curRules[c] + ';';
								}
							}
						}
						break;
					}
				}
				if(found >= 0) {
					sheet.deleteRule(found);
				}
				if(newRules.length) {
					sheet.insertRule(selector + '{' + newRules + '}', rules.length);
					if(param == 'font-family') {
						if(g_stbStandartFontsList
							&& toeInArray(value, g_stbStandartFontsList) == -1
							&& g_stbAllFontsList
							&& toeInArray(value, g_stbAllFontsList) != -1
						) {
							sheet.insertRule('@import url("//fonts.googleapis.com/css?family=' + value.replace(/ /g, '+') + '"); ', 0);
						}
					}
				}
			}
		}

		TablesModel.prototype.getLightenDarkenColor = function(col, amt) {
			var usePound = false;
			if(col[0] == "#") {
				col = col.slice(1);
				usePound = true;
			}
 			var num = parseInt(col, 16),
				r = (num >> 16) + amt,
				b = ((num >> 8) & 0x00FF) + amt,
				g = (num & 0x0000FF) + amt;
			if(r > 255) r = 255;
			else if(r < 0) r = 0;
			if(b > 255) b = 255;
			else if(b < 0) b = 0;
			if(g > 255) g = 255;
			else if(g < 0) g = 0;
			//return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);
			var res = (g | (b << 8) | (r << 16)).toString(16);
			return (usePound?"#":"") + '0'.repeat(6 - res.length) + res;
		}

		TablesModel.prototype.controlSettingsValues = function($element) {
			this._controlSettingsValues($element);
		};
		TablesModel.prototype._controlSettingsValues = function($element) {
			var formData = $('form#settings');
			if($element.is('#table-elements-description')) {
				if(formData.find('#descriptionText').val().length) {
					$element.removeAttr('data-preview-not-redraw');
				}
			} else if($element.is('#table-elements-signature')) {
				if(formData.find('#signatureText').val().length) {
					$element.removeAttr('data-preview-not-redraw');
				}
			}
		}

		TablesModel.prototype.getPreviewHistoryTable = function (userId, preview, period) {
			var self = this,
				container = preview instanceof $ ? preview : $(preview),
				table;

			if(container.length) {
				container.html(app.createSpinner());

				return this.renderFromHistory(userId, app.getParameterByName('id'), period).done(function(response) {
					container.empty().append($(response.table));
					table = container.find('table');
					app.initializeTable(table, app.showTable, function(table) {
						self._afterTablePreview(table);
					});
				});
			}
		};

		TablesModel.prototype.render = function (id, settings) {
			if (isNaN(id = parseInt(id))) {
				throw new Error('Invalid table id.');
			}
			return this.request('render', { id: id, settings: typeof(settings) == 'undefined' ? false : settings, preview: '1' });
		};

		TablesModel.prototype.renderFromHistory = function (userId, tableId, period) {
			if (isNaN(userId = parseInt(userId))) {
				throw new Error('Invalid user id.');
			}
			if (isNaN(tableId = parseInt(tableId))) {
				throw new Error('Invalid table id.');
			}

			return this.request('renderFromHistory', { user_id: userId, table_id: tableId, period: period });
		};

		TablesModel.prototype.renameTable = function (id, title) {
			var $labelShell = $('#stbTableTitleShell'),
				$labelHtml = $('#stbTableTitleLabel'),
				$labelTxt = $('#stbTableTitleTxt');

			if($labelShell.data('sending')) return;
			if(!$labelTxt.data('ready')) return;
			$labelShell.data('sending', 1);
			app.createSpinner($labelShell);
			this.renameTableRequest(app.getParameterByName('id'), $labelTxt.val())
				.done(function (res) {
					if(!res.error) {
						$labelHtml.html( $.trim($labelTxt.val()) );
						$labelTxt.hide( g_stbAnimationSpeed ).data('ready', 0);
						$labelHtml.show( g_stbAnimationSpeed );
						$labelShell.data('edit-on', 0);
					}
					$labelShell.data('sending', 0);
					app.deleteSpinner($labelShell);
				})
				.fail(function (error) {
					$('#stbTableTitleEditMsg').html('Failed to rename table: ' + error);
				});
		};

		TablesModel.prototype.remove = function (id) {
			if (isNaN(id = parseInt(id))) {
				throw new Error('Invalid table id.');
			}

			return this.request('remove', { id: id });
		};

		TablesModel.prototype.isFormula = function (value) {
			if (value) {
				if (value[0] === '=') {
					return true;
				}
			}
			return false;
		};

		TablesModel.prototype.getFormulaResult = function (value, row, col) {
			var instance = app.Editor.Hot;

			if (instance.formulasEnabled && this.isFormula(value)) {
				// translate coordinates into cellId
				var cellId = instance.plugin.utils.translateCellCoords({row: row, col: col}),
					prevFormula = null,
					formula = null,
					needUpdate = false,
					error, result;

				if (!cellId) {
					return;
				}

				// get cell data
				var item = instance.plugin.matrix.getItem(cellId);

				if (item) {
					needUpdate = !!item.needUpdate;

					if (item.error) {
						prevFormula = item.formula;
						error = item.error;

						if (needUpdate) {
							error = null;
						}
					}
				}

				// check if typed formula or cell value should be recalculated
				if ((value && value[0] === '=') || needUpdate) {
					formula = value.substr(1);

					if (!error || formula !== prevFormula) {
						var currentItem = item;

						if (!currentItem) {
							// define item to rulesJS matrix if not exists
							item = { id: cellId, formula: formula };
							// add item to matrix
							currentItem = instance.plugin.matrix.addItem(item);
						}

						// parse formula
						var newValue = instance.plugin.parse(formula, {row: row, col: col, id: cellId});

						if (newValue.error && formula.indexOf('IFERROR') > -1) {
							var matches = formula.match(/\((\(*.*\)*),(\(*.*\)*)\)$/);

							if (matches) {
								var secondParse = instance.plugin.parse(matches[2], {row: row, col: col, id: cellId});

								if (!secondParse.error) {
									newValue.error = null;
									newValue.result = secondParse.result;
								}
							}
						}
						// check if update needed
						needUpdate = (newValue.error === '#NEED_UPDATE');
						// update item value and error
						instance.plugin.matrix.updateItem(currentItem, { value: newValue.result, error: newValue.error, needUpdate: needUpdate});

						error = newValue.error;
						result = newValue.result;

						// update cell value in hot
						value = error || result;
					}
				}
				if (error) {
					// clear cell value
					if (!value) {
						// reset error
						error = null;
					} else {
						// show error
						value = error;
					}
					if (error == '#VALUE!') {
						value = 0;
					}
				}
				// Round float
				/*if (value !== '0' && value !== 0 && value % 1 !== 0) {
					// round float
					var floatValue = parseFloat(value);
					if (floatValue.toString().indexOf('.') !== -1) {
						var afterPointSybolsLength = floatValue.toString().split('.')[1].length;
						if (afterPointSybolsLength > 4) {
							value = floatValue.toFixed(4);
						}
					}
				}*/
			}

			return value;
		};

		TablesModel.prototype.setCellFormat = function(value, formatType) {
			if(value && app.isNumber(value) && !isNaN(value)) {
				var languageData = numeral.languageData(),
					format = jQuery('input[name="' + formatType + 'Format"]').val(),
					delimiters,
					preparedFormat;

				if(!format && typeof format !== 'string' && !format.match(/\d+/)) return value;

				switch(formatType) {
					case 'number':
						delimiters = (format.match(/[^\d]/g) || [',', '.']).reverse();
						languageData.delimiters = {
							decimal: delimiters[0],
							thousands: delimiters[1] || ''
						};

						// We need to use dafault delimiters for format string
						preparedFormat = format
							.replace(format, format
								.replace(delimiters[0], '.')
								.replace(delimiters[1], ',')
						);
						break;
					case 'percent':
						var clearFormat = format.indexOf('%') > -1 ? format.replace('%', '') : format;

						delimiters = (clearFormat.match(/[^\d]/g) || [',', '.']).reverse();
						languageData.delimiters = {
							decimal: delimiters[0],
							thousands: delimiters[1] || ''
						};

						// We need to use dafault delimiters for format string
						preparedFormat = format.replace(
							clearFormat, clearFormat
								.replace(delimiters[0], '.')
								.replace(delimiters[1], ',')
						);
						break;
					case 'currency':
						var formatWithoutCurrency = format.match(/\d.?\d*.?\d*/)[0],
							currencySymbol = format.replace(formatWithoutCurrency,'') || '$';

						delimiters = (formatWithoutCurrency.match(/[^\d]/g) || [',', '.']).reverse();
						languageData.delimiters = {
							decimal: delimiters[0],
							thousands: delimiters[1] || ''
						};
						languageData.currency.symbol = currencySymbol;

						// We need to use dafault delimiters for format string
						preparedFormat = format
							.replace(formatWithoutCurrency, formatWithoutCurrency
								.replace(delimiters[0], '.')
								.replace(delimiters[1], ','))
							.replace(currencySymbol, '$');

						app.Editor.Hot.currencySymbol = currencySymbol;
						app.Editor.Hot.currencyFormat = preparedFormat;
						break;
					default:
						break;
				}
				numeral.language('en', languageData);
				if(preparedFormat) {
					value = numeral(value).format(preparedFormat);
				}
			}
			return value;
		};

		TablesModel.prototype._prepareData = function (data, maxLength) {
			maxLength = maxLength ? maxLength : 200000;

			var dataToJson = JSON.stringify(data)
				,	dataArray = [];

			if(dataToJson.length > maxLength) {
				while(dataToJson.length > maxLength) {
					var newStr = dataToJson.substr(0, maxLength);

					dataArray.push(newStr);
					dataToJson = dataToJson.replace(newStr, '');
				}
				dataArray.push(dataToJson);

				return dataArray;
			} else {
				return dataToJson;
			}
		};

		TablesModel.prototype._afterTablePreview = function(table) {
			if(SDT_DATA.isPro && typeof(app.createEditableFields) != 'function') {	// for compatibility with old pro versions
				$.getScript(SDT_DATA.pluginsUrl + '/tables-generator-pro/src/SupsysticTablesPro/Tables/assets/js/frontend.pro.js');
			}
			// Fix of conflict with handsontable library - it triggers error if user makes click on link without href attribute
			var features = table.data('features');
			if(toeInArray('paging', features) != -1) {
				$('#table-preview').find('.dataTables_paginate .paginate_button').each(function() {
					$(this).attr('href', '#');
					$(this).attr('onclick', 'return false');
				});
				setTimeout(function() {
					$('#table-preview').find('.dataTables_paginate .paginate_button').each(function() {
						$(this).attr('href', '#');
						$(this).attr('onclick', 'return false');
					});
				}, 750);
				table.on('page.dt', function() {
					$('#table-preview').find('.dataTables_paginate .paginate_button').each(function() {
						$(this).attr('href', '#');
						$(this).attr('onclick', 'return false');
					});
					setTimeout(function() {
						$('#table-preview').find('.dataTables_paginate .paginate_button').each(function() {
							$(this).attr('href', '#');
							$(this).attr('onclick', 'return false');
						});
					}, 750);
				});
			}

		};

		TablesModel.prototype._b64EncodeUnicode = function(str) {
			return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
				return String.fromCharCode('0x' + p1);
			}));
		};

		return TablesModel;
	})();

	app.Models = app.Models || {};
	app.Models._Tables = TablesModel;
	app.Models.Tables = new TablesModel();

	$.when( app.Models.Tables.getTablesSettings() ).then(function( data, textStatus, jqXHR ) {
		if(data.success) {
			app.Models.Tables.step = data.settings.table_step;
			g_stbPagination = (typeof(data.settings.editor_pagination) != 'undefined' && data.settings.editor_pagination == 'on');
			g_stbRowsPerPage = (g_stbPagination && data.settings.editor_pagination_rows > 0 ? data.settings.editor_pagination_rows : 1);
		}
	});
}(window.jQuery, window.supsystic.Tables));

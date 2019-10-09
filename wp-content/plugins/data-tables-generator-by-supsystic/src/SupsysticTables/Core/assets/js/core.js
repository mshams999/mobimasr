if(typeof(SDT_DATA) == 'undefined') {
    var SDT_DATA = {};
}
var g_stbServerSideProcessing = false;
var g_stbServerSideProcessingIsActive = false;

(function (vendor, $, window) {

    var appName = 'Tables';
    var dataTableInstances = [];
    var ruleJSInstances = [];
	var extraConfig = {};

    if (!(appName in vendor)) {
        vendor[appName] = {};

        vendor[appName].getAppName = (function() {
            return appName;
        });

		vendor[appName].setExtraConfig = (function(param, value) {
			extraConfig[param] = value;
		});

        vendor[appName].getParameterByName = (function(name) {
            name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");

            var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                results = regex.exec(location.search);

            return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
        });

        vendor[appName].replaceParameterByName = (function(url, paramName, paramValue) {
            var pattern = new RegExp('\\b('+paramName+'=).*?(&|$)');
            if (url.search(pattern) >= 0) {
                return url.replace(pattern,'$1' + paramValue + '$2');
            }
            return url + (url.indexOf('?')>0 ? '&' : '?') + paramName + '=' + paramValue;
        });

        vendor[appName].getAllTableInstances = (function() {
            return dataTableInstances;
        });

		vendor[appName].removeAllTableInstances = (function() {
			dataTableInstances = [];
		});

        vendor[appName].setTableInstance = (function(instance) {
            dataTableInstances.push(instance);
        });

        vendor[appName].getTableInstanceById = (function(id) {
            var allTables = this.getAllTableInstances();

            for(var i = 0; i < allTables.length; i++) {
                if(allTables[i].table_id == id) {
                    return allTables[i];
                }
            }
            return false;
        });

        vendor[appName].getTableInstanceByViewId = (function(viewId) {
            var allTables = this.getAllTableInstances();

            for(var i = 0; i < allTables.length; i++) {
                if(allTables[i].table_view_id == viewId) {
                    return allTables[i];
                }
            }
            return false;
        });

        vendor[appName].removeTableInstanceByViewId = (function(viewId) {
            var allTables = this.getAllTableInstances();

            for(var i = 0; i < allTables.length; i++) {
                if(allTables[i].table_view_id == viewId) {
                    allTables.splice(i, 1);
                    return true;
                }
            }
            return false;
        });

        vendor[appName].getAllRuleJSInstances = (function() {
            return ruleJSInstances;
        });

        vendor[appName].setRuleJSInstance = (function(table) {
            var rootElem = table.closest('.supsystic-tables-wrap'),
                viewId = table.data('view-id');

            ruleJSInstances[viewId] = new ruleJS(rootElem.attr('id'));
            return ruleJSInstances[viewId];
        });

        vendor[appName].getRuleJSInstance = (function(table) {
            var allRuleJS = this.getAllRuleJSInstances(),
                viewId = table.data('view-id');

            if(!allRuleJS[viewId]) {
				this.setRuleJSInstance(table);
            }
            return allRuleJS[viewId];
        });

        vendor[appName].request = (function(route, data) {
			if (!$.isPlainObject(route) || !('module' in route) || !('action' in route)) {
				throw new Error('Request route is not specified.');
			}
            if (!$.isPlainObject(data)) {
                data = {};
            }
            if ('action' in data) {
                throw new Error('Reserved field "action" used.');
            }
            data.action = 'supsystic-tables';

			var url = window.ajaxurl ? window.ajaxurl : ajax_obj.ajaxurl,
				deferred = $.Deferred();

			$.post(url, $.extend({}, { route: route }, data))
				.done(function (response, textStatus, jqXHR) {
					if (response.success) {
						deferred.resolve(response, textStatus, jqXHR);
					} else {
						if(data._maxIter) {
							retryAjax(deferred, url, route, data, 1, data._maxIter);
						} else {
							var message = typeof response.message !== 'undefined' ? response.message : 'There are errors during the request.';

							deferred.reject(message, textStatus, jqXHR);
						}
					}
				}).fail(function (jqXHR, textStatus, errorThrown) {
					if(data._maxIter) {
						retryAjax(deferred, url, route, data, 1, data._maxIter);
					} else {
						deferred.reject(errorThrown, textStatus, jqXHR);
					}
				});

			function retryAjax(def, url, route, data, curIter, maxIter) {
				$.post(url, $.extend({}, { route: route }, data))
					.done(function (response, textStatus, jqXHR) {
						if (response.success) {
							def.resolve(response, textStatus, jqXHR);
						} else {
							var message = typeof response.message !== 'undefined' ? response.message : 'There are errors during the request.';

							retryErrorHandler(def, url, route, data, curIter, maxIter, message, textStatus, jqXHR);
						}
					}).fail(function (jqXHR, textStatus, errorThrown) {
						retryErrorHandler(def, url, route, data, curIter, maxIter, errorThrown, textStatus, jqXHR);
					});
			}

			function retryErrorHandler(def, url, route, data, curIter, maxIter, errorThrown, textStatus, jqXHR) {
				curIter++;
				if(curIter < maxIter) {
					retryAjax(def, url, route, data, curIter, maxIter);
				} else {
					def.reject(errorThrown, textStatus, jqXHR);
				}
			}

            return deferred.promise();
        });

		vendor[appName].setTableMobileWidth = (function(isMobile) {
			$('div .supsystic-tables-wrap').each(function () {
				isMobile = (typeof(isMobile) == 'undefined' ? true : isMobile);
				var ssDiv = $(this),
					widthAttr = ssDiv.data('table-width-' + (isMobile ? 'mobile' : 'fixed'));
				if(typeof(widthAttr) != 'undefined') {
					ssDiv.css('display', (widthAttr == 'auto' ? 'inline-block' : '')).css('width', widthAttr);
				}
			});
		});

		vendor[appName].initTablesOnPage = (function() {
			this._initTablesOnPage();
		});

		vendor[appName]._initTablesOnPage = (function() {
			var self = this,
				firstTableId = '',
				firstTableViewId = '',
				firstTable = '',
				firstTableWrapper = '',
				firstTableFirstRow = '';

			if($(window).width() <= 991) {
				self.setTableMobileWidth();
			}
			$('.supsystic-table').each(function () {
				self.initializeTable(this, self.showTable, function(table) {
					// This is used when table is hidden in tabs and can't calculate itself width to adjust on small screens
					if (table.is(':visible')) {
						// Fix bug in FF and IE which not supporting max-width 100% for images in td
						self._calculateImages(table);
					} else {
						table.data('isVisible', setInterval(function(){
							if (table.is(':visible')) {
								clearInterval(table.data('isVisible'));
								self._calculateImages(table);
							}
						}, 250));
					}
					// Align all tables on page by the columns width depending on the columns width of first table on page
					if(table.data('align-by-first-table')) {
						firstTableId = firstTableId || $('.supsystic-table:first').data('id');
						firstTable = firstTable || $('#supsystic-table-' + firstTableId);
						firstTableViewId = firstTable.data('view-id');
						firstTableWrapper = firstTableWrapper || firstTable.parents('#supsystic-table-' + firstTableViewId);
						firstTableFirstRow = firstTable.data('head') ? firstTable.find('thead tr:first-child th') : firstTable.find('tbody tr:first-child td');

						if(firstTableViewId != table.data('view-id')) {
							var currentTableWrapper = table.parents('#supsystic-table-' + table.data('view-id'));

							currentTableWrapper.css({
								width: firstTableWrapper.get(0).style.width
							});
							table.css({
								width: firstTable.get(0).style.width
							});
							currentTableWrapper.find('.supsystic-table').each(function() {
								var curTable = $(this),
									curTableFirstRow = curTable.data('head') ? curTable.find('thead tr:first-child th') : curTable.find('tbody tr:first-child td');

								$.each(curTableFirstRow, function (index, element) {
									if(firstTableFirstRow[index]) {
										$(this).width($(firstTableFirstRow[index]).get(0).style.width);
									}
								});
							});
						}
					}
					//if row has merged cells no need place header there
					if(table.data('merged') && table.hasClass('ColWithMergeCellsAlign')) {
						var mergedData = table.data('merged');
						$.each(mergedData, function( index, value ) {
							var rowNumWithMergeCell = value.row;
							var numForEq = Number(rowNumWithMergeCell)-1;
							table.find('tbody tr:eq('+numForEq+')').closest('tr').addClass('haveMergedCell');
						});
						self.setCellAttributes(table.parents('.supsystic-tables-wrap:first').find('.DTFC_LeftWrapper, DTFC_RightWrapper, .dataTables_scrollHead, .dataTables_scrollFoot').find('th, td'));
					}
					if(typeof self.getTableInstanceById(table.data('id')).fnAdjustColumnSizing == 'function' ) {
						setTimeout(function(){
							table.trigger('responsive-resize.dt');
							self.getTableInstanceById(table.data('id')).fnAdjustColumnSizing(false);
						}, 350);
					}
				});
			});
		});

		vendor[appName]._getOriginalImageSizes = (function(img) {
			var tempImage = new Image(),
				width,
				height;
			if ('naturalWidth' in tempImage && 'naturalHeight' in tempImage) {
				width = img.naturalWidth;
				height = img.naturalHeight;
			} else {
				tempImage.src= img.src;
				width = tempImage.width;
				height = tempImage.height;
			}
			return {
				width: width,
				height: height
			};
		});

		vendor[appName]._calculateImages = (function($table) {
			var self = this,
				$images = $table.find('img');
			if ($images.length > 0 && /firefox|trident|msie/i.test(navigator.userAgent)) {
				$images.hide();
				$.each($images, function(index, el) {
					var $img = $(this),
						originalSizes = self._getOriginalImageSizes(this);
					if ($img.closest('td, th').width() < originalSizes.width) {
						$img.css('width', '100%');
					}
				});
				$images.show();

			}
		});

        vendor[appName].createSpinner = (function(elem) {
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
        });

        vendor[appName].deleteSpinner = (function(elem) {
            var icon = elem.attr('disabled', false).find('.fa');

            if(icon) {
                icon.attr('class', icon.data('icon'));
                icon.data('icon', '');
            }
        });

        vendor[appName].initializeTable = (function(table, callback, finalCallback, reinit, addInstance) {
            reinit = typeof reinit != 'undefined' ? reinit : {};
            addInstance = typeof addInstance != 'undefined' ? addInstance : true;

            var self = this,
				$table = (table instanceof $ ? table : $(table)),
                features = $table.data('features'),
                config = {},
                responsiveMode = $table.data('responsive-mode'),
                searchingSettings = $table.data('searching-settings'),
                tableInstance = {},
                defaultFeatures = {
                    autoWidth:  false,
                    info:       false,
                    ordering:   false,
                    paging:     false,
                    responsive: false,
                    searching:  false,
                    stateSave:  false,
                    api: 		true,
                    retrieve:   true,
                    processing: true,
                    initComplete: callback,
                    headerCallback: function( thead, data, start, end, display ) {
                        $(thead).closest('thead').find('th').each(function() {
							self.setStylesToCell(this);
                        });
                    },
                    footerCallback: function( tfoot, data, start, end, display ) {
                        $(tfoot).closest('tfoot').find('th').each(function() {
							self.setStylesToCell(this);
                        });
                    },
					// order param disable the default table sorting.
					// it should be here because of Woocommerce addon:
					// it has no hidden header for tables without header
					// and in triggers an error during initializing.
					// order param should be disabled later during sorting activation
					order: []
                };
			
			g_stbServerSideProcessing = $table.data('server-side-processing') && $table.data('server-side-processing') == 'on';

			// Fix for searching by merged cells
			$table.find('tbody td[data-colspan], tbody td[data-rowspan]').each(function(index, item) {
				var cell = $(item),
					cellData = cell.html();

				// prevent of copy cell data if it contains tags with id attribute - it must be unique on page
				if(!cellData.toString().match(/<.*?id=['|"].*?['|"].*?>/g)) {
					var cellOrValue = cell.data('original-value'),
						cellFormula = cell.data('formula'),
						cellOrder = cell.data('order'),
						table = cell.parents('table:first'),
						colIndex = cell.index(),
						rowIndex = cell.parents('tr:first').index(),
						colspan = cell.data('colspan'),
						rowspan = cell.data('rowspan');

					for(var i = rowIndex + 1; i <= rowIndex + rowspan; i++) {
						for(var j = colIndex + 1; j <= colIndex + colspan; j++) {
							var hiddenCell = table.find('tbody tr:nth-child(' + i + ') td:nth-child(' + j + ')');

							if(hiddenCell.data('hide')) {
								hiddenCell.html(cellData);
								hiddenCell.data('original-value', cellOrValue);
								hiddenCell.attr('data-original-value', cellOrValue);
								hiddenCell.data('order', cellOrder);
								hiddenCell.attr('data-order', cellOrder);
								if(cellFormula) {
									hiddenCell.data('formula', cellFormula);
									hiddenCell.attr('data-formula', cellFormula);
								}
							}
						}
					}
				}
			});

			// Set features
            $.each(features, function () {
                var featureName = this.replace(/[-_]([a-z])/g, function (g) { return g[1].toUpperCase(); });
                config[featureName] = true;
            });
			if($table.data('search-value') && !config['searching']) {
				config['searching'] = true;
			}
            if (toeInArray('searching', features) != -1 && searchingSettings) {
                if (searchingSettings.minChars > 0 ||
                    searchingSettings.resultOnly ||
                    searchingSettings.strictMatching
                ) {
                    $.fn.dataTable.ext.search.push(function(settings, data) {
                        var $searchInput = $(settings.nTableWrapper).find('.dataTables_filter input'),
                            searchValue = $searchInput.val();

                        if (searchingSettings.resultOnly && searchValue.length === 0) {
                            if (searchingSettings.showTable) {
                                return false;
                            }
                            return false;
                        }
                        if (searchingSettings.strictMatching) {
                            searchValue = $.fn.dataTable.util.escapeRegex(searchValue);
                            var regExp = new RegExp('^' + searchValue, 'i');

                            for (var i = 0; i < data.length; i++) {
                                var words = data[i].replace(/\s\s+/g, ' ').split(' ');

                                for (var j = 0; j < words.length; j++) {
                                    if (words[j].match(regExp)) {
                                        return true;
                                    }
                                }
                            }
                            return false;
                        } else {
                            return data.join(' ').toLowerCase().indexOf(searchValue.toLowerCase()) !== -1
                        }
                    });
                    $table.on('init.dt', function (event, settings)  {
                        if (!settings) {
                            return;
                        }

                        var $tableWrapper = $(settings.nTableWrapper),
                            $tableSearchInput = $tableWrapper.find('.dataTables_filter input'),
                            $customInput = $tableSearchInput.clone();

                        $tableSearchInput.replaceWith($customInput);

                        $customInput.on('input change', function() {
                            if (!searchingSettings.showTable) {
                                if (searchingSettings.resultOnly && searchingSettings.minChars && (this.value.length < searchingSettings.minChars || !this.value.length)) {
                                    $table.hide();
                                    $table.parent().find('.dataTables_paginate').hide();
                                } else {
                                    $table.show();
                                    $table.parent().find('.dataTables_paginate').show();
                                }
                            }
                            if (searchingSettings.minChars && (this.value.length < searchingSettings.minChars && this.value.length !== 0)) {
                                event.preventDefault();
                                return false;
                            }
                            $table.api().draw();
                        });

                        if (searchingSettings.resultOnly && !searchingSettings.showTable) {
                            $table.hide();
                            $table.parent().find('.dataTables_paginate').hide();
                        }
                    });
                }
                if (searchingSettings.columnSearch) {
					var inputTop = (searchingSettings.columnSearchPosition && searchingSettings.columnSearchPosition == 'top'),
                        tPosition = inputTop ? 'thead' : 'tfoot';
					if(!$table.find('.stbColumnsSearchWrapper').length) {
                        var headerRow = $table.find('thead tr:first').find('th');
						if(headerRow.length) {
							var searchRow = '<tr class="stbColumnsSearchWrapper">',
								func = inputTop ? 'prepend' : 'append';
							for (var i = 0; i < headerRow.length; i++) {
								var cellItem = $(headerRow[i]),
									cellClass = '',
									cellStyle = '';
								if(!g_stbServerSideProcessing){
									cellStyle = cellItem.is(':visible') ? '' : 'style="display: none;"';
								}
								if(cellItem.hasClass('invisibleCell')){
									cellClass = ' class="invisibleCell"'
								}
								searchRow += '<th ' + cellClass + cellStyle + '><input class="search-column" type="text" /></th>';
							}
							searchRow += '</tr>';
							if($table.find(tPosition).length == 0) {
								$table.append($('<' + tPosition + '>'));
							}
							$table.find(tPosition)[func](searchRow);
						}
					}
					if($table.data('auto-index') !== 'off'){
						$('.stbColumnsSearchWrapper th:first-child input').css({'visibility':'hidden'});
					}
				}
            }
            if (toeInArray('ordering', features) != -1) {
                var sortingEnable = ['_all'],
                    sortingDisable = [],
                    aaSorting = [],
                    multipleSorting = $table.data('multiple-sorting'),
                    disableSorting = $table.data('disable-sorting');

                if(!$table.data('head')) {
                    sortingDisable = ['_all'];
                }
                if(disableSorting && disableSorting.length) {
                    sortingDisable = disableSorting;
                }
                if(multipleSorting && multipleSorting.length) {
                    aaSorting = multipleSorting;
                } else {
                    var columnsCount = $table.find('tr:first th').length,
                        sortColumn = $table.data('sort-column') || 0,
                        sortOrder = $table.data('sort-order') || 'asc',
                        columnNumber = sortColumn - 1;

                    if(columnNumber >= 0 && columnNumber < columnsCount) {
                        aaSorting.push([columnNumber, sortOrder]);
                    }
                }
                config.aoColumnDefs = [
                    { type: 'natural-nohtml-ci', targets: '_all' },
                    { "sortable": false, "targets": sortingDisable },
                    { "sortable": true, "targets": sortingEnable }
                ];
                config.aaSorting = aaSorting;
				delete defaultFeatures.order;
            }
            if ($table.data('pagination-length')) {
                var paginationLength = String($table.data('pagination-length'));

				config.aLengthMenu = [];
				config.aLengthMenu.push(paginationLength.replace('All', -1).split(',').map(Number));
				config.aLengthMenu.push(paginationLength.split(','));
            }
			if ($table.data('auto-index') && $table.data('auto-index') !== 'off') {
				$table.on('draw.dt', function() {
					var isFirst = true,
						index = 1;
					$table.api().column(0).nodes().each(function (cell, i) {
						var style = window.getComputedStyle(cell);
						if(isFirst) {
							index = i + 1;
							isFirst = false;
						}
						if(style.display !== 'none' && !cell.classList.contains('invisibleCell')) {
							cell.innerHTML = index;
							index++;
						}
					});
				});
			}

			// Set responsive mode
            if (responsiveMode == 0) {
                // Responsive Mode: Standart Responsive Mode
                var labelStyles = '<style>',
                    id = '#' + $table.attr('id');

                // Add header data to each response row
                $table.find('thead th').each(function(index, el) {
                    labelStyles += id + '.oneColumnWithLabels td:nth-of-type(' + (index + 1) + '):before { content: "' + $(this).text() + '"; }';
                });
                labelStyles += '</style>';
                $table.append(labelStyles);

                $(window).on('resize', $table, function(event) {
                    event.preventDefault();
                    clearTimeout($table.data('resizeTimer'));

                    $table.data('resizeTimer', setTimeout(function() {
                        $table.removeClass('oneColumn oneColumnWithLabels');
                        $table.css('width', '100%');
                        var tableWidth = $table.width(),
                            wrapperWidth = $table.closest('.supsystic-tables-wrap').width();
                        if (tableWidth > wrapperWidth) {
                            $table.addClass('oneColumn');

                            if ($table.data('head') == 'on') {
                                $table.addClass('oneColumnWithLabels');
                            }
                        }
                    }, 150));
                    if(g_stbServerSideProcessing) {
                        $table.find('td').each(function() {
                            $(this).css({'width': '','min-width': ''});
                        });
                    }
                }).trigger('resize');
            } else if (responsiveMode === 1) {
                // Responsive Mode: Automatic Column Hiding
                config.responsive = {
                    details: {
                        renderer: function (api, rowIdx, columns) {
                            var $table = $(api.table().node()),
                                $subTable = $('<table/>');

                            $.each(columns, function (i, col) {
                                if (col.hidden) {
                                    var $cell = $(api.cell(col.rowIndex, col.columnIndex).node()).clone(),
                                        markup = '<tr data-dt-row="'+col.rowIndex+'" data-dt-column="'+col.columnIndex+'">';
                                    if ($table.data('head') == 'on') {
                                        var $headerContent = $(api.table().header()).find('th').eq(col.columnIndex).html();
                                        markup += '<td>';
                                        if ($headerContent) {
                                            markup += $headerContent;
                                        }
                                        markup += '</td>';
                                    }
                                    markup += '</tr>';
                                    $cell.after(
                                        $('<td>')
                                            .addClass('collapsed-cell-holder')
                                            .attr('data-cell-row', col.rowIndex)
                                            .attr('data-cell-column', col.columnIndex)
                                            .hide()
                                    );
                                    $subTable.append($(markup).append($cell.addClass('collapsed').show()));
                                }
                            });
                            return $subTable.is(':empty') ? false : $subTable;
                        }
                    }
                };
                $table.on('responsive-resize.dt', function(event, api, columns) {
					if(typeof api == 'undefined' || typeof columns == 'undefined') {
						var tbl = $(this),
							instance = vendor[appName].getTableInstanceById(tbl.data('id'));

						if(instance) {
							api = typeof api != 'undefined' ? api : instance.api();
							columns = typeof columns != 'undefined' ? columns : instance.api().columns();
						}
					}
                    if ($table.width() > $table.parent().width()) {
                    	$table.css('width', '100%');
                    	$table.css('max-width', '100%');
                        api.responsive.recalc();
                        return;
                    }
                    for (var i = 0, len = columns.length; i < len; i++) {
                        if (columns[i]) {
							$table.find('tr > td.collapsed-cell-holder[data-cell-column="' + i + '"]').each(function(index, el) {
                                var $this = $(this);
                                var $cell = $(api.cell(
                                    $this.data('cell-row'),
                                    $this.data('cell-column')
                                ).node());

                                if ($cell.hasClass('collapsed')) {
                                    $cell.removeClass('collapsed');
                                    $this.replaceWith($cell);
                                }
                            });
                        }
                    }
                });
            } else if (responsiveMode === 2) {
                // Responsive Mode: Horizontal Scroll
                config.scrollX = true;
                var firstRow = $table.find('tbody tr:first-child td');
                if(firstRow.length) {
   					var cntCols = firstRow.length;
                	$table.find('thead tr:first-child th').each(function(i, th){
                		if(cntCols > i && $(th).css('width')) {
                			firstRow.eq(i).css('width', $(th).css('width'));
                		}
                	});
                }
            }
            if(responsiveMode === 2 || responsiveMode === 3) {
                // Responsive Mode: 2 - Horizontal Scroll, 3 - Disable Responsivity
                var fixedHead = $table.data('head') && $table.data('fixed-head'),
                    fixedFoot = $table.data('foot') && $table.data('fixed-foot'),
                    fixedLeft = $table.data('fixed-left'),
                    fixedRight = $table.data('fixed-right');

                // TODO: correct the code to set fixed header and fixed footer in the standard way
                // TODO: https://datatables.net/extensions/fixedheader/#Features
                //config.fixedHeader = {
                //	header: false,
                //	footer: false
                //};
                //if (fixedHead) {
                //	config.fixedHeader.header = true;
                //}
                //if (fixedFoot) {
                //	config.fixedHeader.footer = true;
                //}
                if(fixedHead || fixedFoot) {
                    config.scrollY = $table.data('fixed-height');
                    config.scrollCollapse = true;
                }
                if ($table.data('fixed-cols')) {
                    config.fixedColumns = {
                        leftColumns: fixedLeft ? parseInt(fixedLeft) : 0,
                        rightColumns: fixedRight ? parseInt(fixedRight) : 0
                    };
                    config.scrollX = true;
                }
            }

            // Add translation
            var langData = typeof g_stbTblLangData != 'undefined' ? JSON.parse(g_stbTblLangData) : $table.data('translation'),
                translation = langData || {},
                override = $table.data('override');

            if(typeof translation != 'object') {
                translation = {};	// for just to be sure that it is object
            }
            $.each(override, function(key, value) {
                if(value.length) {
                    translation[key] = value;
                    // We need to support old DT format, cuz some languages use it
                    translation['s' + key.charAt(0).toUpperCase() + key.substr(1)] = value;
                }
            });
            config.language = translation;

            var ajaxSource = {};

            if(g_stbServerSideProcessing) {
                var route = {"action" : "getPageRows", "module": "tables"},
                    loadedRows = [],
                    loadedCells = [],
                    headerRowsCount = ($table.data('head') == 'on' ? $table.data('head-rows-count') : 0),
                    footerRowsCount = ($table.data('foot') == 'on' ? $table.data('foot-custom-rows-count') : 0);
                ajaxSource = {
                    processing: true,
                    serverSide: true,
                    ajax: {
                        url: window.ajaxurl ? window.ajaxurl : ajax_obj.ajaxurl,
                        type: 'POST',
                        data: {
                            action: "supsystic-tables",
                            route: route,
                            id: $table.data('id'),
                            searchParams: searchingSettings,
                            searchValue: function () {
                                var input = $('#' + $table.attr('id') + '_filter.dataTables_filter').find('input');
                                return (input.length ? input.val() : '');
                            },
                            header: headerRowsCount,
                            footer: footerRowsCount,
							beforeSend: function() {
								g_stbServerSideProcessingIsActive = true;
							}},
                        dataFilter: function(data){
                            var json = jQuery.parseJSON(data),
                                rows = $(json.rows).find('tr'),
                                aData = [];

                            loadedRows = [];
                            loadedCells = [];
                            for(var i = 0; i < rows.length; i++) {
                                var row = rows[i];
                                loadedRows.push(row.attributes);
                                var cells = $(row).find('td'),
                                    attrs = [],
                                    vals = [];
                                for(var j = 0; j < cells.length; j++) {
                                    var cell = cells[j];
                                    attrs.push(cell.attributes);
                                    vals.push(cell.innerHTML);
                                }
                                loadedCells.push(attrs);
                                aData.push(vals);
                            }
                            json.rows = '';
                            json.data = aData;
							g_stbServerSideProcessingIsActive = false;
                            return JSON.stringify(json);
                        }
                    },
                    createdRow: function (row, data, dataIndex) {
                        if(typeof(loadedRows[dataIndex]) != 'undefined') {
                            $(loadedRows[dataIndex]).each(function () {
                                $(row).attr(this.name, this.value);
                            });
                        }
                    }
                };
                if(typeof(config.aoColumnDefs) == 'undefined') {
                    config.aoColumnDefs = [];
                }
                config.aoColumnDefs.push({
                    targets: '_all',
                    cellType: 'td',
                    createdCell: function (td, cellData, rowData, row, col) {
                        if(typeof(loadedCells[row][col]) != 'undefined') {
                            var rowspan = 1,
                                colspan = 1;
                            $(loadedCells[row][col]).each(function () {
                                if (this.name == 'data-rowspan' && this.value > 1) {
                                    rowspan = this.value;
                                }
                                if(this.name == 'data-colspan' && this.value > 1) {
                                    colspan = this.value;
                                }
                            });
                            if(rowspan > 1 || colspan > 1) {
                                var stopRow = row + parseInt(rowspan),
                                    stopCol = col + parseInt(colspan),
                                    startRow = colspan > 1 ? row : row + 1,
                                    hide;
                                if(stopRow >= loadedCells.length) {
                                    stopRow = loadedCells.length;
                                }
                                if(stopCol >= loadedCells[row].length) {
                                    stopCol = loadedCells[row].length;
                                }

                                for(i = startRow; i < stopRow; i++) {
                                    if(i > row) {
                                        hide = document.createAttribute('data-hide');
                                        hide.value = 'true';
                                        loadedCells[i][col].setNamedItem(hide);
                                    }
                                    for(j = col + 1; j < stopCol; j++) {
                                        hide = document.createAttribute('data-hide');
                                        hide.value = 'true';
                                        loadedCells[i][j].setNamedItem(hide);
                                    }
                                }
                            }
                            $(loadedCells[row][col]).each(function () {
                                if(this.name != 'data-formula') {
                                    $(td).attr(this.name, this.value);
                                }
                            });
                        }
                    }
                });
            }
			$table.trigger('beforeInitializeTable', $table);
			tableInstance = $table.dataTable($.extend({}, defaultFeatures, config, extraConfig, ajaxSource, reinit));
            tableInstance.table_id = $table.data('id');
            tableInstance.table_view_id = $table.data('view-id');
			tableInstance.fnFakeRowspan();
			self._checkOnClickPopups($table);

            if(g_stbServerSideProcessing) {
                $('.dataTables_processing').css('z-index', '10');
            } else {
                self.setColumnSearch($table);
            }
			$table.on('draw.dt', function(){
				var searching = $table.data('searching-settings');
				if(searching && ('columnSearch' in searching) && searching.columnSearch == 'on') {
					self.setColumnSearch($table);
				}
				if(!g_stbServerSideProcessing && $table.data('merged')) {
					tableInstance.fnResetFakeRowspan();
				}
			});
            if(addInstance) {
               this.setTableInstance(tableInstance);
            }
			return typeof finalCallback  == "function" ? finalCallback(tableInstance) : tableInstance;
        });

        /** Callback for displaying table after initializing
         * @param {object} settings - DataTables settings object
         * @param {object} json - JSON data retrieved from the server if the ajax option was set. Otherwise undefined.
         */
        vendor[appName].showTable = (function(settings, json) {
            var self = vendor[appName],	// it is callback so "this" does not equal vendor[appName] object
				$table = this instanceof $ ? this : settings,	// for compatibility with old pro versions
                $tableWrap = $table.closest('.supsystic-tables-wrap'),
				tableSelector = '#supsystic-table-' + $table.data('view-id') + ' #supsystic-table-' + $table.data('id'),
                afterTableLoadedScriptString = $table.attr('data-after-table-loaded-script'),
                _ruleJS = self.setRuleJSInstance($table),
                responsiveMode = $table.data('responsive-mode'),
                fixedHeader = $table.data('fixed-head') == 'on',
                fixedFooter = $table.data('fixed-foot') == 'on',
                fixedColumns = $table.data('fixed-right') > 0 || $table.data('fixed-left') > 0,
                viewId = $table.data('view-id');

			// Apply custom CSS styles, which have been set through the table editor
			$table.find('th, td').each(function () {
				self.setStylesToCell(this);
			});
			$table.bind('column-visibility.dt draw.dt', function (e) {
				$(this).find('th, td').each(function () {
					self.setStylesToCell(this);
				});
			});

			// Remove sorting visual elements from the tags if there is no header on table
            if (!$table.data('head')) {
                $table.find('th').removeClass('sorting sorting_asc sorting_desc sorting_disabled');
            }

            // Calculate formulas
            _ruleJS.init();

            // Set formats
			self.formatDataAtTable($table, true);

			// Apply shortcode param "search"
			if($table.data('search-value')) {
				$table.api().search($table.data('search-value')).draw();
			}

            // Show comments on tap
            if ('ontouchstart' in window || navigator.msMaxTouchPoints) {
				$table.parents('.supsystic-tables-wrap:first').find('td, th').on('click', self.applyMobileTableComments);
            }

			// Prepare Contact Form by Supsystic buttons
			$table.parents('.supsystic-tables-wrap:first').find('th, td').each(self._contactFormBtnCellClb);

			// Page change callback
			$table.on('page.dt', function() {
				if(g_stbServerSideProcessing) {
					g_stbServerSideProcessingIsActive = true;
				}
				var table = $(this),
					tableSelector = '#supsystic-table-' + table.data('view-id') + ' #supsystic-table-' + table.data('id');
				self.applyTableEventClb(self.pageEvent, 50, tableSelector);
				if($table.data('pagination-scroll') == 'on') {
					$('html, body').animate({
						scrollTop: table.closest('.dataTables_wrapper').offset().top
					}, 100);
				}
			});

            // Frontend fields
            if (typeof(self.createEditableFields) == 'function') {	// for compatibility with old pro versions
                var $editableFields = $tableWrap.find('.editable'),
                    $selectableFields = $tableWrap.find('.selectable'),
                    $tableId = $table.data('id'),
                    useEditableFields = typeof(useEdit) != 'undefined' && typeof(useEdit[$tableId]) != 'undefined'
                        ? useEdit[$tableId]
                        : false;

                if(useEditableFields || (SDT_DATA.isAdmin && SDT_DATA.isPro)) {
                    if (typeof(self.setFrontendFields) == 'function') {
						self.setFrontendFields($table);
                    } else if (typeof(self.setAllFields) == 'function') {
                        self.setAllFields($table, $editableFields, $selectableFields);
                    } else {
                        self.createEditableFields($table, $editableFields);
                    }
					$table.on('init.dt', function() {
						$table.on('responsive-resize.dt responsive-display.dt draw.dt', function() {
							$editableFields.off('click.sup');	// for compatibility with old pro versions
							self.updateAfterRedraw($table);
						});
					});
                }
            }
            if(typeof(self.setImgLightbox) == 'function'){
            	self.setImgLightbox($table);
            }

			// apply page.dt event by change table pagination via select
			var paginationSelect = $tableWrap.find('.dataTables_length select');
			if(paginationSelect.length) {
				paginationSelect.on('change', function() {
					$table.trigger('page.dt');
				});
			}

			self.applyTableEventClb(self.fixHeaderOfHiddenColumns, 50, tableSelector);

			$table.trigger('beforeShowTable', $table);

            // Show table
            $tableWrap.prev('.supsystic-table-loader').hide();
            $tableWrap.css('visibility', 'visible');

            self.fixSortingForMultipleHeader($table);

            if(responsiveMode === 2 || fixedHeader || fixedFooter) {
                // Responsive Mode: Horizontal Scroll
                $(window).on('resize', $table, function(event) {
                	var tBody = $tableWrap.find('.dataTables_scrollBody'),
                        tBodyTable = tBody.find('.supsystic-table');

                    if(tBody.width() > tBodyTable.width() || $tableWrap.width() > tBodyTable.width()) {
						tBody.width(tBodyTable.width());
						$tableWrap.find('.dataTables_scrollHead, .dataTables_scrollFoot, .dataTables_scrollBody').width(tBodyTable.width() + 1);
						/*
						var scrollTables = $tableWrap.find('.dataTables_scrollHead, .dataTables_scrollFoot');
						scrollTables.width(tBodyTable.width() + 1);
						scrollTables.find('table').width(tBodyTable.width() + 1);*/
					}
                    if(tBody.isHorizontallyScrollable()){
                        tBody.css({'border-bottom' : 'none'});
                    }else{
                        tBody.removeStyle('border-bottom');
                    }
                    var table = self.getTableInstanceById($table.data('id'));
                    if(typeof table.fnAdjustColumnSizing == 'function' ) {
						setTimeout(function(){
							table.fnAdjustColumnSizing(false);
						}, 350);
					}
                }).trigger('resize');

                // need resize twice to get better frontend view
                var tBody = $tableWrap.find('.dataTables_scrollBody'),
					tBodyTable = tBody.find('.supsystic-table');

                if(tBodyTable.is(":visible")){
                    setTimeout(function() {
                        $(window).trigger('resize');
                    }, 200);
                }
                var $tHeadTable = $tableWrap.find('.dataTables_scrollHead .supsystic-table');
                if($tHeadTable.length) {
                    self.formatDataAtTable($tHeadTable, true);
                }
				var $tFootTable = $tableWrap.find('.dataTables_scrollFoot .supsystic-table');
                if($tFootTable.length) {
                    self.formatDataAtTable($tFootTable, true);
                }
            }
            // Correct width of fixed header / footer
            if(fixedHeader || fixedFooter) {
                $table.api().fixedHeader.adjust();

				var i = 1;
                setTimeout(function() {
					var flag = fixedHeader,
						el = fixedHeader
							? $tableWrap.find('.dataTables_scrollHead table thead tr:first-child th')
							: $tableWrap.find('.dataTables_scrollFoot table tfoot tr:first-child th');

                    el.each(function() {
						var thWidth = $tableWrap.find('.dataTables_scrollBody table tbody tr:first-child td:nth-child('+ i + ')');

						$(this).css({
							'width': thWidth.outerWidth(),
							'min-width': thWidth.outerWidth(),
							'box-sizing': 'border-box'
						});
						if(fixedFooter && flag){
							var footerEl = $tableWrap.find('.dataTables_scrollFoot table tfoot tr:first-child th:nth-child('+ i + ')');
							footerEl.css({
								'width': thWidth.outerWidth(),
								'min-width': thWidth.outerWidth(),
								'box-sizing': 'border-box'
							});
						}
						i++;
					});
				}, 200);
            }

            // Correct width of fixed columns
            if(fixedColumns) {
                $table.api().fixedColumns().relayout();

                //var tableCaption = $('.dataTables_scrollHead caption');
				//
                //if(tableCaption.length) {
					//self._fixTableCaption(tableCaption.height(), viewId, 10);
                //}
            }
            /* Fix for Horizontal scroll responsive mode if table has different width for one column in header and body */
            if(!fixedHeader && !fixedFooter && responsiveMode === 2 && toeInArray('auto_width', $table.data('features')) == -1) {
                $tableWrap.find('.dataTables_scrollBody table thead tr:first-child th').each(function() {
                    var tableWidth = $table.width(),
                        tableWrapWidth = $tableWrap.width();

                    if(tableWrapWidth > tableWidth){
                        $tableWrap
                            .find('.dataTables_scrollHeadInner, .dataTables_scrollBody, .dataTables_scrollFootInner')
                            .addClass('fit-content');
                    }
                });
            }

            // Load user custom scripts
            if (afterTableLoadedScriptString !== undefined) {
                afterTableLoadedScriptString = afterTableLoadedScriptString.substring(1, afterTableLoadedScriptString.length - 1);

                var afterTableLoadedScript = b64DecodeUnicode(afterTableLoadedScriptString).replace(/"/g, "'"),
                    executeScript = new Function(afterTableLoadedScript);

                if (typeof executeScript === "function") {
                    setTimeout(function() {
                        executeScript();
                    }, 1000);
                }
            }

            if(g_stbServerSideProcessing) {
                $table.on('draw.dt', function (e) {
                    var searching = $table.data('searching-settings');
                    if(searching && ('columnSearch' in searching) && searching.columnSearch == 'on') {
                        self.setColumnSearch($table);
                    }
                    self.getTableInstanceByViewId(viewId).fnFakeRowspan();
                    if(responsiveMode === 0 || responsiveMode === 2) {
                        $(window).trigger('resize');
                    }
                }).trigger('draw.dt');
            }

            function b64DecodeUnicode(str) {
                return decodeURIComponent(Array.prototype.map.call(atob(str), function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
            }
        });

		vendor[appName].applyTableEventClb = (function(clb, timeout) {
			// Callback for applying events' actions and other functions to tables with server side processing (SSP)
			timeout = timeout ? timeout : 0;
			var self = this,
				args = Array.from(arguments);

			if(g_stbServerSideProcessing && g_stbServerSideProcessingIsActive) {
				setTimeout(function() {
					self.applyTableEventClb.apply(self, args);
				}, 50);
			} else {
				if(typeof clb == 'function') {
					args = args.slice(2);
					setTimeout(function() {
						clb.apply(self, args);
					}, timeout);
				}
			}
		});

		vendor[appName].pageEvent = (function(tableSelector) {
			var table = $(tableSelector),
				tableWrapper = table.parents('.supsystic-tables-wrap:first');

			this.getRuleJSInstance(table).init();
			this.formatDataAtTable(table, true);
			this.fixHeaderOfHiddenColumns(table);
			if ('ontouchstart' in window || navigator.msMaxTouchPoints) {
				tableWrapper.find('td, th').on('click', this.applyMobileTableComments);
			}
			tableWrapper.find('td, th').each(this._contactFormBtnCellClb);
		});

		vendor[appName].fixHeaderOfHiddenColumns = (function($table) {
			$table = $table instanceof $ ? $table : $($table);

			var tableWrapper = $table.parents('.supsystic-tables-wrap:first');

			if(!$table.data('head')) {
				tableWrapper.find('thead').each(function() {
					var thead = $(this);
					thead.find('th').each(function(iter, item) {
						var th = $(this),
							itemIndex = iter + 1,
							columnAllTd = thead.parents('table:first').find('tbody td:nth-child(' + itemIndex + ')'),
							columnInvTd = columnAllTd.filter('.invisibleCell'),
							hidden = columnAllTd.length > 0 && columnAllTd.length == columnInvTd.length;
						if(hidden) {
							// Fix of correct displaying of tables with hidden rows / columns for tables without headers
							th.addClass('invisibleCell');
						}
					});
				});
			}
		});

		vendor[appName].applyMobileTableComments = (function(e) {
			var $elem = $(this),
				title = $elem.attr('title');

			if(title) {
				var tableViewId = $elem.parents('table.supsystic-table:first').data('view-id'),
					cellId = $elem.data('cell-id'),
					comment = $('.stbMobileComment[data-table="'+tableViewId+'"][data-cell="' + cellId + '"]');

				if(!comment.length) {
					comment = $('<div class="stbMobileComment" style="display:none;"/>');
					comment.text(title)
						.data('table', tableViewId)
						.attr('data-table', tableViewId)
						.data('cell', cellId)
						.attr('data-cell', cellId)
						.appendTo('body');
				}
				comment.css({
					top: (e.pageY - 70) + 'px',
					left: (e.pageX + 20) + 'px'
				}).fadeIn('slow');

				setTimeout(function() {
					comment.fadeOut('slow');
				}, 2500);
			}
		});

        vendor[appName]._contactFormBtnCellClb = (function(e) {
			var cell = $(this),
				y = cell.data('y'),
				pair,
				valueCell;
			if(cell.html().indexOf('cfsPreFill') != -1) {
				var cellHtml = cell.html().replace(/href=["|']([^"]*?)["|']/g, function(a, b) {
					if(b.indexOf('cfsPreFill') != -1) {
						var newB = b.split('&amp;');
						if(newB.length) {
							for(var i = 0; i < newB.length; i++) {
								pair = newB[i].split('=');
								if(pair.length && pair[1].match(/[A-Za-z]/)) {
									valueCell = cell.parents('tr:first').find('[data-cell-id="'+pair[1]+y+'"]');
									if(valueCell.length) {
										pair[1] = $.trim(valueCell.html());
									}
								}
								newB[i] = pair.join('=');
							}
							newB = newB.join('&amp;');
							a = a.replace(b, newB);
						}
						return a;
					}
				});
				cell.html(cellHtml);
			}
		});

        vendor[appName].setColumnSearch = (function(table) {
			var searchingSettings = table.data('searching-settings'),
                inputs = table.parents('.dataTables_wrapper:first').find('.stbColumnsSearchWrapper .search-column');
			if(inputs.length == 0) {
                return;
			}
			//$(document).off('keyup change', ".dataTables_wrapper:first .stbColumnsSearchWrapper .search-column")
			//			.on('keyup change', ".dataTables_wrapper:first .stbColumnsSearchWrapper .search-column",function () {
			inputs.off('keyup.dtg change.dtg').on('keyup.dtg change.dtg',function () {
				var input = $(this),
					position = input.parents('th:first').index(),
					value = this.value,
					column = table.api().column(position);
				if (column.search() !== value) {
					column.search(value.replace(/;/g, "|"), true, false).draw();
					setTimeout(function() {
						column.draw();
					}, 50);
				}
			});
        });

        vendor[appName].setCopyEvents = (function(obj, events) {
            $.each(events, function (event, handlers) {
                $.each(handlers, function (j, handler) {
                    $(obj).unbind(event).bind(event, handler);
                });
            });
        });

        // Callback for executing script after table is initialized
        vendor[appName].executeScript = (function(table) {
            var $table = (table instanceof $ ? table : $(table)),
                $tableWrap = $table.closest('.supsystic-tables-wrap');

			this.getRuleJSInstance($table).init();
            $tableWrap.prev('.supsystic-table-loader').hide();
            $tableWrap.css('visibility', 'visible');
        });

        vendor[appName].fixSortingForMultipleHeader = (function(table) {
            if(table.data('head-rows-count') > 1 && table.data('sort-order')) {
                var thead = table.find('thead tr').get().reverse();

                // Fix of sorting for table with multiple header (when header has more than 1 row)
                if(table.data('head')) {
                    $.each(table.find('thead tr:last-child th'), function (index, element) {
                        var th = $(element),
                            nthChild = index + 1;

                        if(th.data('hide')) {
                            $(thead).each(function() {
                                var item = $(this).find('th:nth-child(' + nthChild + ')');

                                if(!item.data('hide')) {
                                    item.addClass('sorting');
                                    item.click(function() {
                                        th.trigger('click');
                                        if(th.hasClass('sorting')) {
                                            item.removeClass('sorting_asc');
                                            item.removeClass('sorting_desc');
                                            item.addClass('sorting');
                                        } else if(th.hasClass('sorting_asc')) {
                                            item.removeClass('sorting');
                                            item.removeClass('sorting_desc');
                                            item.addClass('sorting_asc');
                                        } else if(th.hasClass('sorting_desc')) {
                                            item.removeClass('sorting');
                                            item.removeClass('sorting_asc');
                                            item.addClass('sorting_desc');
                                        }
                                    });
                                    return false; // stop .each() function
                                }
                            });
                        }
                    });
                }
            }
        });

        vendor[appName].formatDataAtTable = (function(table, correctSorting) {
			correctSorting = correctSorting ? correctSorting : false;

            var self = this,
				numberFormat = table.data('number-format'),
                generalCurrencyFormat = table.data('currency-format'),
                generalPercentFormat = table.data('percent-format'),
                generalDateFormat = table.data('date-format'),
                generalTimeFormat = table.data('time-format');

            table.find('th, td').each(function(index, el) {
                var $this = $(this);

                if((table.data('auto-index') != 'off' && $this.is(':first-child'))
					|| (table.data('responsive-mode') == 1 && table.hasClass('collapsed') && $this.hasClass('child'))
					|| $this.find('.search-column').length
				) {
                    // Break current .each iteration
                    return;
                }

                var languageData = numeral.languageData(),
                    format = $this.data('cell-format'),
                    formatType = $this.data('cell-format-type'),
                    preparedFormat,
                    delimiters,
                    value = $.trim($this.html()),
                    noFormat = false;

				// Fix data params for cells which use formulas, which depended on cells with shortcodes inside
				if(correctSorting && toeInArray(formatType, ['date', 'time_duration']) == -1) {
					var dataTableInstance = typeof table.api == 'function' ? table : self.getTableInstanceById(table.data('id'));

					if($this.data('original-value') != value) {
						$this.data('original-value',value);
						$this.attr('data-original-value',value);
					}
					if($this.data('data-order') != value) {
						$this.data('order');
						$this.attr('data-order',value);
						if(dataTableInstance) {
							dataTableInstance.api().cell($this).invalidate();
						}
					}
				}
				if(value) {
					if($this.data('cell-reformat')) {
						switch(formatType) {
							case 'date':
								var newDate = moment(value,format);
								if(newDate.isValid()) {
									value = newDate.format(generalDateFormat);

									$this.data('cell-format',generalDateFormat);
									$this.attr('data-cell-format',generalDateFormat);

									$this.data('original-value',value);
									$this.attr('data-original-value',value);

									$this.data('order',value);
									$this.attr('data-order',value);

									if(!g_stbServerSideProcessing) {
										$this.data('cell-reformat',false);
										$this.attr('data-cell-reformat',0);
									}
								}
								break;
							case 'time_duration':
								var newTime = moment(value,format),
									isValid = false;
								// console.log(newTime);

								if(newTime.isValid()) {
									value = newTime.format(generalTimeFormat);
									isValid = true;
								} else {
									newTime = moment.duration(value);
									if(newTime._milliseconds || value == 0) {
										value = newTime.format(generalTimeFormat);
										isValid = true;
									}
								}
								if(isValid) {
									$this.data('cell-format',generalTimeFormat);
									$this.attr('data-cell-format',generalTimeFormat);

									$this.data('original-value',value);
									$this.attr('data-original-value',value);

									$this.data('order',value);
									$this.attr('data-order',value);

									if(!g_stbServerSideProcessing) {
										$this.data('cell-reformat',false);
										$this.attr('data-cell-reformat',0);
									}
								}
								break;
							default:
								break;
						}
					} else if(self.isNumber(value) && !isNaN(value)) {
						numberFormat = numberFormat ? numberFormat.toString() : '';

						switch(formatType) {
							case 'percent':
								format = format ? format : generalPercentFormat;

								if(format) {
									format = format.toString();

									var clearFormat = format.indexOf('%') > -1 ? format.replace('%','') : format;

									value = value.indexOf('%') > -1 ? $this.data('original-value') : value;
									delimiters = (clearFormat.match(/[^\d]/g) || [',','.']).reverse();
									languageData.delimiters = {
										decimal: delimiters[0],thousands: delimiters[1]
									};

									// We need to use dafault delimiters for format string
									preparedFormat = format.replace(clearFormat,clearFormat.replace(delimiters[0],'.').replace(delimiters[1],','));
								} else {
									noFormat = true;
								}
								break;
							case 'currency':
								format = format ? format : generalCurrencyFormat;

								if(format) {
									format = format.toString();

									var formatWithoutCurrency = format.match(/\d.?\d*.?\d*/)[0],
										currencySymbol = format.replace(formatWithoutCurrency,'') || '$';	// We need to set currency symbol in any case for normal work of numeraljs

									delimiters = (formatWithoutCurrency.match(/[^\d]/g) || [',','.']).reverse();

									languageData.delimiters = {
										decimal: delimiters[0],
										thousands: delimiters[1]
									};
									languageData.currency.symbol = currencySymbol;
									// We need to use dafault delimiters for format string
									preparedFormat = format
										.replace(formatWithoutCurrency, formatWithoutCurrency
											.replace(delimiters[0],'.')
											.replace(delimiters[1],','))
										.replace(currencySymbol,'$');
								} else {
									noFormat = true;
								}
								break;
							case 'date':case 'time_duration':
								noFormat = true;
								break;
							default:
								if(numberFormat) {
									format = numberFormat;
									delimiters = (format.match(/[^\d]/g) || [',','.']).reverse();
									languageData.delimiters = {
										decimal: delimiters[0],
										thousands: delimiters[1]
									};

									// We need to use dafault delimiters for format string
									preparedFormat = format.replace(format,format.replace(delimiters[0],'.').replace(delimiters[1],','));
									break;
								} else {
									noFormat = true;
								}
								break;
						}
						if(noFormat) {
							noFormat = false;
						} else {
							numeral.language('en',languageData);
							value = numeral(value).format(preparedFormat);
						}
					}
				}
                $this.html(value);
            });
        });

        vendor[appName].isNumber = (function(value) {
            if (value) {
                if (value.toString().match(/^-{0,1}\d+\.{0,1}\d*$/)) {
                    return true;
                }
            }
            return false;
        });

        vendor[appName].prepareFormulaToParse = (function (value) {
			var stringsInFormula = value.match(/".+?"|'.+?'/g);

			if(stringsInFormula && stringsInFormula.length) {
				var clearValue = value.replace(/".+?"|'.+?'/g, '%STR%'),
					index = 0;

				clearValue = clearValue.toUpperCase();
				value = clearValue.replace(/%STR%/g, function(match) {
					var val = match;

					if(index < stringsInFormula.length) {
						val = stringsInFormula[index];
						index++;
					}
					return val;
				});
			} else {
				value = value.toUpperCase();
			}
			return value;
		});

        vendor[appName].Base64 = {
            _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
            encode : function (input) {
                var self = vendor[appName].Base64,
					output = "",
					i = 0,
					chr1, chr2, chr3, enc1, enc2, enc3, enc4;

                input = self._utf8_encode(input);

                while (i < input.length) {
                    chr1 = input.charCodeAt(i++);
                    chr2 = input.charCodeAt(i++);
                    chr3 = input.charCodeAt(i++);

                    enc1 = chr1 >> 2;
                    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                    enc4 = chr3 & 63;

                    if (isNaN(chr2)) {
                        enc3 = enc4 = 64;
                    } else if (isNaN(chr3)) {
                        enc4 = 64;
                    }
                    output = output +
					self._keyStr.charAt(enc1) + self._keyStr.charAt(enc2) +
					self._keyStr.charAt(enc3) + self._keyStr.charAt(enc4);
                }

                return output;
            },
            // private method for UTF-8 encoding
            _utf8_encode : function (string) {
                string = string.replace(/\r\n/g,"\n");
                var utftext = "";

                for (var n = 0; n < string.length; n++) {

                    var c = string.charCodeAt(n);

                    if (c < 128) {
                        utftext += String.fromCharCode(c);
                    }
                    else if((c > 127) && (c < 2048)) {
                        utftext += String.fromCharCode((c >> 6) | 192);
                        utftext += String.fromCharCode((c & 63) | 128);
                    }
                    else {
                        utftext += String.fromCharCode((c >> 12) | 224);
                        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                        utftext += String.fromCharCode((c & 63) | 128);
                    }

                }

                return utftext;
            }
        };

		vendor[appName].getClassesRegexp = (function() {
			return {
				color: /color\-([0-9a-f]{6})/,
				background: /bg\-([0-9a-f]{6})/,
				fontFamily: /ffamily\-([a-z_]+)/i,
				fontSize: /fsize\-([0-9]+)/
			}
		});

		vendor[appName].setStylesToCell = (function(cell) {
			var $cell = cell instanceof jQuery ? cell : $(cell),
				viewId = $cell.parents('.supsystic-table:first').data('view-id'),
				classes = this.getClassesRegexp(),
				cellClassNames = $cell.get(0).className,
				color = classes.color.exec(cellClassNames),
				background = classes.background.exec(cellClassNames),
				fontFamily = classes.fontFamily.exec(cellClassNames),
				fontSize = classes.fontSize.exec(cellClassNames);

			if (null !== color) {
				$cell.css({color: '#' + color[1]});
			}
			if (null !== background) {
				$cell.css({backgroundColor: '#' + background[1]});
			}
			if (null !== fontFamily) {
				var family = fontFamily[1].replace(/_/g, ' '),
					familyName = fontFamily[1].replace(/_/g, '+'),
					familyString = '@import url("//fonts.googleapis.com/css?family=' + familyName + '");';

				if(g_stbStandartFontsList
					&& toeInArray(family, g_stbStandartFontsList) == -1
					&& g_stbAllFontsList
					&& toeInArray(family, g_stbAllFontsList) != -1
				) {
					var style = this.getFrontendCellStylesElem(viewId);

					if(style.text().indexOf(familyString) == -1) {
						style.text(familyString + '\n' + style.text());
					}
				}
				$cell.css({fontFamily: family});
			}
			if (null !== fontSize) {
				var lineHeight = +fontSize[1] + 6;
				$cell.css({fontSize: fontSize[1] + 'px', lineHeight: lineHeight + 'px'});
			}
		});

		vendor[appName].getAdminCellStylesElem = (function() {
			var $style = $('#supsystic-tables-style');

			if (!$style.length) {
				$style = $('<style/>', { id: 'supsystic-tables-style' });
				$('head').append($style);
			}
			return $style;
		});

		vendor[appName].getFrontendCellStylesElem = (function(viewId) {
			var $style = $('#supsystic-table-' + viewId + '-css');

			if (!$style.length) {
				$style = $('<style/>', { id: 'supsystic-table-' + viewId + '-css' });
				$('head').append($style);
			}
			return $style;
		});

		vendor[appName]._fixTableCaption = (function(captionHeight, viewId, counter) {
			if(counter < 0) return false;

			// Fix for displaying of caption for tables with fixed columns
			var self = this,
				tableViewHtmlId = '#supsystic-table-' + viewId,
				fixedColumnsWrapper = $(tableViewHtmlId + ' .DTFC_LeftWrapper, ' + tableViewHtmlId + ' .DTFC_RightWrapper');

			if(fixedColumnsWrapper.length) {
				fixedColumnsWrapper.find('caption').css({ display: 'none' });
				fixedColumnsWrapper.css({ top: captionHeight + 'px' });
			} else {
				counter--;
				setTimeout(function() {
					self._fixTableCaption(captionHeight, viewId, counter);
				}, 50);
			}
		});

		vendor[appName]._getChunksArray = (function(arr, len) {
			var chunks = [],
				i = 0,
				n = arr.length;

			while (i < n) {
				chunks.push(arr.slice(i, i += len));
			}

			return chunks;
		});

		vendor[appName]._checkOnClickPopups = (function( $table ) {
			// Integration with our PopUp plugin
			// Only after table was inited - we can do this, and only in that way it will work
			if(typeof(_ppsBindOnElementClickPopups) !== 'undefined' && $table && $table.size()) {
				var $bindedLinks = $table.find('[href*="#ppsShowPopUp_"].ppsClickBinded');
				if($bindedLinks && $bindedLinks.size()) {
					$bindedLinks.removeClass('ppsClickBinded').unbind('click');
				}
				_ppsBindOnElementClickPopups();
			}
		});

		vendor[appName].setCellAttributes = function (cells) {
			var colspan, rowspan;
			for (var i = 0; i < cells.length; i++) {
				if (cells[i].getAttribute('data-hide')) {
					cells[i].style.display = 'none';
				}
				if (colspan = cells[i].getAttribute('data-colspan')) {
					if (colspan > 1) {
						cells[i].setAttribute('colspan', colspan);
						$(cells[i]).attr('colspan', colspan);
					}
				}
				if (rowspan = cells[i].getAttribute('data-rowspan')) {
					if (rowspan > 1) {
						cells[i].setAttribute('rowspan', rowspan);
					}
				}
			}
		};
    }

}(window.supsystic = window.supsystic || {}, window.jQuery, window));

// For compatibility to old PRO versions
function classesRegexp() {
	return window.supsystic.Tables.getClassesRegexp();
}
function getAdminCellStylesElem() {
	return window.supsystic.Tables.getAdminCellStylesElem();
}

/**
 * We will not use just jQUery.inArray because it is work incorrect for objects
 * @return mixed - key that was found element or -1 if not
 */
function toeInArray(needle, haystack) {
    if(typeof(haystack) == 'object') {
        for(var k in haystack) {
            if(haystack[ k ] == needle)
                return k;
        }
    } else if(typeof(haystack) == 'array') {
        return jQuery.inArray(needle, haystack);
    }
    return -1;
}

(function($) {
    /**
     * Detects whether element can be scrolled vertically.
     * @this jQuery
     * @return {boolean}
     */
    $.fn.isVerticallyScrollable = function() {
        if (this.scrollTop()) {
            // Element is already scrolled, so it is scrollable
            return true;
        } else {
            // Test by actually scrolling
            this.scrollTop(1);

            if (this.scrollTop()) {
                // Scroll back
                this.scrollTop(0);
                return true;
            }
        }
        return false;
    };

    /**
     * Detects whether element can be scrolled horizontally.
     * @this jQuery
     * @return {boolean}
     */
    $.fn.isHorizontallyScrollable = function() {
        if (this.scrollLeft()) {
            // Element is already scrolled, so it is scrollable
            return true;
        } else {
            // Test by actually scrolling
            this.scrollLeft(1);

            if (this.scrollLeft()) {
                // Scroll back
                this.scrollLeft(0);
                return true;
            }
        }
        return false;
    };

    $.extend($.expr.pseudos || $.expr[ ":" ], {
        "vertically-scrollable": function(a, i, m) {
            return $(a).isVerticallyScrollable();
        },
        "horizontally-scrollable": function(a, i, m) {
            return $(a).isHorizontallyScrollable();
        }
    });

    $.fn.removeStyle = function(style)
    {
        var search = new RegExp(style + '[^;]+;?', 'g');

        return this.each(function()
        {
            $(this).attr('style', function(i, style)
            {
                return style && style.replace(search, '');
            });
        });
    };

	if (!Array.from) {
		// Fix of compatibility with IE browser to use ES6 feature
		Array.from = (function () {
			var toStr = Object.prototype.toString;
			var isCallable = function (fn) {
				return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
			};
			var toInteger = function (value) {
				var number = Number(value);
				if (isNaN(number)) { return 0; }
				if (number === 0 || !isFinite(number)) { return number; }
				return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
			};
			var maxSafeInteger = Math.pow(2, 53) - 1;
			var toLength = function (value) {
				var len = toInteger(value);
				return Math.min(Math.max(len, 0), maxSafeInteger);
			};

			// The length property of the from method is 1.
			return function from(arrayLike/*, mapFn, thisArg */) {
				// 1. Let C be the this value.
				var C = this;

				// 2. Let items be ToObject(arrayLike).
				var items = Object(arrayLike);

				// 3. ReturnIfAbrupt(items).
				if (arrayLike == null) {
					throw new TypeError('Array.from requires an array-like object - not null or undefined');
				}

				// 4. If mapfn is undefined, then let mapping be false.
				var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
				var T;
				if (typeof mapFn !== 'undefined') {
					// 5. else
					// 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
					if (!isCallable(mapFn)) {
						throw new TypeError('Array.from: when provided, the second argument must be a function');
					}

					// 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
					if (arguments.length > 2) {
						T = arguments[2];
					}
				}

				// 10. Let lenValue be Get(items, "length").
				// 11. Let len be ToLength(lenValue).
				var len = toLength(items.length);

				// 13. If IsConstructor(C) is true, then
				// 13. a. Let A be the result of calling the [[Construct]] internal method
				// of C with an argument list containing the single item len.
				// 14. a. Else, Let A be ArrayCreate(len).
				var A = isCallable(C) ? Object(new C(len)) : new Array(len);

				// 16. Let k be 0.
				var k = 0;
				// 17. Repeat, while k < len… (also steps a - h)
				var kValue;
				while (k < len) {
					kValue = items[k];
					if (mapFn) {
						A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
					} else {
						A[k] = kValue;
					}
					k += 1;
				}
				// 18. Let putStatus be Put(A, "length", len, true).
				A.length = len;
				// 20. Return A.
				return A;
			};
		}());
	}
}(jQuery));

(function ($, app) {
	// Custom Natural Sort Function
	// see https://datatables.net/plug-ins/sorting/natural
	function naturalSort (a, b, html) {
		var re = /(^-?[0-9]+(\.?[0-9]*)[df]?e?[0-9]?%?$|^0x[0-9a-f]+$|[0-9]+)/gi,
			sre = /(^[ ]*|[ ]*$)/g,
			dre = /(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[\/\-]\d{1,4}[\/\-]\d{1,4}|^\w+, \w+ \d+, \d{4})/,
			hre = /^0x[0-9a-f]+$/i,
			ore = /^0/,
			htmre = /(<([^>]+)>)/ig,
		// convert all to strings and trim()
			x = a.toString().replace(sre, '') || '',
			y = b.toString().replace(sre, '') || '';
		// remove html from strings if desired
		if (!html) {
			x = x.replace(htmre, '');
			y = y.replace(htmre, '');
		}
		// chunk/tokenize
		var	xN = x.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
			yN = y.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
		// numeric, hex or date detection
			xD = parseInt(x.match(hre), 10) || (xN.length !== 1 && x.match(dre) && Date.parse(x)),
			yD = parseInt(y.match(hre), 10) || xD && y.match(dre) && Date.parse(y) || null;

		// first try and sort Hex codes or Dates
		if (yD) {
			if ( xD < yD ) {
				return -1;
			}
			else if ( xD > yD )	{
				return 1;
			}
		}

		// natural sorting through split numeric strings and default strings
		for(var cLoc=0, numS=Math.max(xN.length, yN.length); cLoc < numS; cLoc++) {
			// find floats not starting with '0', string or 0 if not defined (Clint Priest)

			/*supsystic*/
			//var oFxNcL = !(xN[cLoc] || '').match(ore) && parseFloat(xN[cLoc], 10) || xN[cLoc] || 0;
			//var oFyNcL = !(yN[cLoc] || '').match(ore) && parseFloat(yN[cLoc], 10) || yN[cLoc] || 0;
			var oFxNcL = parseFloat(xN[cLoc], 10) || xN[cLoc] || undefined;
			var oFyNcL = parseFloat(yN[cLoc], 10) || yN[cLoc] || undefined;
			/*****/

			// handle numeric vs string comparison - number < string - (Kyle Adams)
			if (isNaN(oFxNcL) !== isNaN(oFyNcL)) {
				return (isNaN(oFxNcL)) ? 1 : -1;
			}
			// rely on string comparison if different types - i.e. '02' < 2 != '02' < '2'
			else if (typeof oFxNcL !== typeof oFyNcL) {
				oFxNcL += '';
				oFyNcL += '';
			}
			if (oFxNcL < oFyNcL) {
				return -1;
			}
			if (oFxNcL > oFyNcL) {
				return 1;
			}
		}
		return 0;
	}

	$.fn.dataTableExt.oApi.fnFakeRowspan = function (oSettings) {
		if(oSettings) {
			var cells;
			$.each(oSettings.aoData, function(index, rowData) {
				app.setCellAttributes(rowData.anCells);
			});
			if (oSettings.aoHeader.length) {
				cells = [];
				$.each(oSettings.aoHeader, function(index, rowData) {
					$.each(rowData, function(index, cellData) {
						cells.push(cellData.cell);
					});
				});
				app.setCellAttributes(cells);
			}
			if (oSettings.aoFooter.length) {
				cells = [];
				$.each(oSettings.aoFooter, function(index, rowData) {
					$.each(rowData, function(index, cellData) {
						cells.push(cellData.cell);
					});
				});
				app.setCellAttributes(cells);
			}
		}
		return this;
	};
	$.fn.dataTableExt.oApi.fnResetFakeRowspan = function (oSettings) {
		if(oSettings) {
			var displayRows = oSettings.aiDisplay,
				mergedData = $(oSettings.nTable).data('merged');
			if(!mergedData || mergedData.length == 0 || displayRows.length == 0) return this;

			var rows = oSettings.aoData,
				rowNums = {};
			$.each(displayRows, function(index, rowNum) {
				var cells = rows[rowNum].anCells;
				rowNums[cells[0].getAttribute('data-y')] = rowNum;
				for(var i = 0; i < cells.length; i++) {
					$(cells[i]).css('display', '');			
					cells[i].setAttribute('rowspan', 1);
					cells[i].setAttribute('colspan', 1);
				}
			});
			$.each(mergedData, function(index, value) {
				var firstRow = Number(value.row) + 1,
					lastRow = firstRow + Number(value.rowspan) - 1,
					colspan = Number(value.colspan),
					firstCol = Number(value.col),
					lastCol = firstCol + colspan - 1,
					rowspan = 0;
				for(var r = firstRow; r <= lastRow; r++) {
					if(r in rowNums) {
						if(rowspan == 0) {
							firstRow = r;
						}
						for(var c = firstCol + (firstRow == r ? 1 : 0); c <= lastCol; c++) {
							rows[rowNums[r]].anCells[c].style.display = 'none';
						}
						rowspan++;
					}
				}
				if(rowspan > 0) {
					var mergedCell = rows[rowNums[firstRow]].anCells[firstCol];
					if(rowspan > 1) {
						mergedCell.setAttribute('rowspan', rowspan);
					}
					if(colspan > 1) {
						mergedCell.setAttribute('colspan', colspan);
					}
				}
			});
		}
		return this;
	};

	$.extend( $.fn.dataTableExt.oSort, {
		"natural-asc": function ( a, b ) {
			return naturalSort(a,b,true);
		},
		"natural-desc": function ( a, b ) {
			return naturalSort(a,b,true) * -1;
		},
		"natural-nohtml-asc": function( a, b ) {
			return naturalSort(a,b,false);
		},
		"natural-nohtml-desc": function( a, b ) {
			return naturalSort(a,b,false) * -1;
		},
		"natural-ci-asc": function( a, b ) {
			a = a.toString().toLowerCase();
			b = b.toString().toLowerCase();

			return naturalSort(a,b,true);
		},
		"natural-ci-desc": function( a, b ) {
			a = a.toString().toLowerCase();
			b = b.toString().toLowerCase();

			return naturalSort(a,b,true) * -1;
		},
		"natural-nohtml-ci-asc": function( a, b ) {
			a = a.toString().toLowerCase();
			b = b.toString().toLowerCase();

			return naturalSort(a,b,false);
		},
		"natural-nohtml-ci-desc": function( a, b ) {
			a = a.toString().toLowerCase();
			b = b.toString().toLowerCase();

			return naturalSort(a,b,false) * -1;
		}
	} );

}(window.jQuery, window.supsystic.Tables));
(function ($, app, undefined) {

    var Formula = (function () {
        function Formula(editor) {
            var input = $('#formula'),
				inputData = {},
				inputTimeout = false;

			this.getEditor = function () {
				return editor;
			};

            this.getInput = function () {
                return input;
            };

			this.getInputTimeout = function () {
				return inputTimeout;
			};

			this.setInputTimeout = function (val) {
				inputTimeout = val;
			};

			this.getInputData = function () {
				return inputData;
			};

			this.setInputData = function (val) {
				inputData = val;
			};
        }

        Formula.prototype.getValue = function () {
            return this.getInput().val();
        };

        Formula.prototype.setValue = function (value) {
            this.getInput().val(value);
        };

        Formula.prototype.getSupportedFormulas = function () {
            if (typeof ruleJS != 'function') {
                return null;
            }

            return ruleJS().helper.SUPPORTED_FORMULAS;
        };

        Formula.prototype.subscribe = function () {
            this.getEditor().addHook('afterSelection', $.proxy(function () {
                var range = this.getEditor().getSelectedRange();

                this.setValue(
                    this.getEditor().getDataAtCell(
                        range.highlight.row,
                        range.highlight.col
                    )
                );
            }, this));

            this.getInput().on('focus', $.proxy(function () {
                if(undefined === this.getEditor().getSelectedRange()) {
                    this.getEditor().selectCell(0, 0);
                }
            }, this));

            this.getInput().on('keyup', $.proxy(function (e) {
				// Enter, Tab, ArrowUp, ArrowLeft, ArrowRight, ArrowDown buttons
				if (toeInArray((e.keyCode || e.which), [13, 9, 37, 38, 39, 40]) != -1) return false;

				var self = this,
					range = self.getEditor().getSelectedRange();

				self.setInputData({
					row: range.highlight.row,
					col: range.highlight.col,
					oldVal: self.getEditor().getDataAtCell(range.highlight.row, range.highlight.col),
					newVal: self.getValue()
				});

				if(!self.getInputTimeout()) {
					setTimeout(function() {
						var keyupData = self.getInputData();

						if(keyupData.oldVal != keyupData.newVal) {
							self.getEditor().setDataAtCell(
								keyupData.row,
								keyupData.col,
								keyupData.newVal
							);
						}
						self.setInputTimeout(false);
					}, 500);
					self.setInputTimeout(true);
				}
            }, this));

            this.getInput().autocomplete({
                source: $.map(this.getSupportedFormulas(), function (formula) {
                    return '=' + formula;
                })
            });
        };

        return Formula;
    })();

    app.Editor = app.Editor || {};
    app.Editor._Formula = Formula;

}(window.jQuery, window.supsystic.Tables));
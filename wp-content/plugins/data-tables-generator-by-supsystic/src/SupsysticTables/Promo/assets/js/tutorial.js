(function($, pointers) {

	pointers.setPointer = function() {
		pointers = this;

		if (!this.stepNumber) {
			this.stepNumber = 0;
		}

		pointerData = pointers.pointersData[this.stepNumber];

		if (!pointerData) {
			return;
		}

		$target = $(pointerData.target);

		if (!$target.length) {
			return;
		}

		$pointer = $target.pointer({
			pointerClass: pointerData.class,
			content: pointerData.title + pointerData.content,
			position: { 
				edge: pointerData.edge,
				align: pointerData.align
			},
			show: function(event, t) {
				var trigger = 0;

				switch(Number(pointers.stepNumber)) {
					case 5:
						// step-5 - Editor tab
						trigger = 2;
						break;
					case 6:
						// step-7 - CSS tab
						trigger = 3;
						break;
					case 7:
						// step-8 - Diagrams tab
						trigger = 4;
						break;
					case 8:
						// step-8 - Diagrams tab
						trigger = 5;
						break;
					case 10:
						// step-10 - Settings tab
						trigger = 1;
						break;
					default:
						break;
				}
				if(trigger) {
					$('.supsystic-plugin .tabs-wrapper li:eq('+ trigger +') .button').trigger('click');
				}
			},
			close: function(event) {
				if (pointers.hasNextStep) {
					pointers.stepNumber += 1;
					sessionStorage.setItem('supsystic-tables-tutorial-step', pointers.stepNumber);

					if (pointerData.nextURL && window.location.href !== pointerData.nextURL) {
						window.location.replace(pointerData.nextURL).done(function() {
							pointers.setPointer();
						});
					} else {
						pointers.setPointer();
					}
				} else {
					$.post(ajaxurl, {
						action: 'supsystic-tables-tutorial-close'
					});
					pointers.stepNumber = 0;
					sessionStorage.removeItem('supsystic-tables-tutorial-step');
				}
			}
		});
		pointers.current = $pointer;
		pointers.openPointer();
		action = this.actions[pointerData.id];
		if (typeof action == 'function') {
			action.call(this);
		}
	};

	pointers.openPointer = function() {		  
		var $pointer = pointers.current;

		if (!typeof $pointer === 'object' ) {
			return;
		}

		$('html, body').animate({
			scrollTop: $pointer.offset().top - 200
		}, 300, function() {
			var $widget = $pointer.pointer('widget');
			pointers.setNext($widget);
			$pointer.pointer('open');
		});
	};

	pointers.setNext = function($widget) {
		this.hasNextStep = false;
		pointers = this;
		if(typeof $widget === 'object') {
			$buttons = $widget.find('.wp-pointer-buttons');
			$closeButton = $buttons.find('a').first().removeClass('close');
			$closeButton.html(this.close).addClass('button button-secondary stop-tutorial');

			if (this.stepNumber < this.pointersData.length - 1) {
				this.hasNextStep = true;
				if (this.pointersData[this.stepNumber].nextURL) {
					$nextButton = $closeButton.clone(true, true);
					$nextButton.addClass('next button button-primary');
					$nextButton.html(this.next).appendTo($buttons);
				}
			}

			$closeButton.on('mousedown', function(event) {
				pointers.hasNextStep = false;
			});
		}
	};

	stepNumber = sessionStorage.getItem('supsystic-tables-tutorial-step');

	var getUrlParameter = function(param) {
		var pageURL = decodeURIComponent(window.location.search.substring(1)),
			pageURLVariables = pageURL.split('&'),
			paramName = [];

		for (var i = 0; i < pageURLVariables.length; i++) {
			paramName = pageURLVariables[i].split('=');

			if (paramName[0] === param) {
				return paramName[1] === undefined ? true : paramName[1];
			}
		}
		return false;
	};

	var fromBegin = getUrlParameter('supsystic_tutorial');

	if(fromBegin && fromBegin == 'begin') {
		pointers.stepNumber = 1;
	} else if (stepNumber !== null) {
		pointers.stepNumber = Number(stepNumber);
	} else {
		pointers.stepNumber = 0;
	}

	pointers.actions = {
		'step-0': function() {
			pointers = this;
			$('#toplevel_page_supsystic-tables').on('click', 'a', function(event) {
				pointers.current.pointer('close');
			});
		},
		'step-2': function() {
			pointers = this;
			$('#menuItem_addTable').parents('li:first').one('click', function(event) {
				pointers.current.pointer('close');
			});
		},
		'step-3': function() {
			pointers = this;
			$('#addDialog + .ui-dialog-buttonpane button:last-child').one('click', function(event) {
				pointers.current.pointer('close');
			});
		}
	};

	pointers.init = function() {
		this.setPointer();
	};

	$(document).ready(function() {
		pointers.init();
	});

})(jQuery, DataTablesPromoPointers);
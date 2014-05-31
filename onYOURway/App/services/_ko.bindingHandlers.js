//#region input bindings

////add ko binding for return key
//ko.bindingHandlers.returnKey = {
//  init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
//    ko.utils.registerEventHandler(element, 'keydown', function (evt) {
//      if (evt.keyCode === 13) {
//        evt.preventDefault();
//        evt.target.blur();
//        //var value = valueAccessor(),
//        //    allBindings = allBindingsAccessor();
//        //value(allBindings.param);
//        valueAccessor().call(viewModel);
//      }
//    });
//  }
//};

//#endregion input bindings

//#region map bindings for leaflet
ko.bindingHandlers.map = {
	init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
		var options = valueAccessor();
		//console.log('[bindingHandlers] map binding init', options);
		options.initialize(element.id);
	} //init
}; //map

ko.bindingHandlers.ventures = {
	//init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
	//	var options = valueAccessor();
	//	console.log('[bindingHandlers] ventures binding init', options.data);
	//}, //init
	update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
		var options = valueAccessor();
		//console.log('[bindingHandlers] ventures binding update', viewModel, options.data);
		viewModel.location.drawMarkers(options.map, options.data());
	} //update
}; //ventures

//#endregion map bindings for leaflet

//#region form control bindings


////bindinghandler for bootstrap-typeahead.js
ko.bindingHandlers.typeahead = {
	init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
		var $element = $(element);
		var allBindings = allBindingsAccessor();
		var bindingValue = ko.utils.unwrapObservable(valueAccessor());

		if (bindingValue.source) {
			//if bindingValue has source property assume it is typeahead options object
			$element
				.attr("autocomplete", "off")
				.typeahead(bindingValue)
			;
		}
		else {
			//pass options individually
			$element
				.attr("autocomplete", "off")
				.typeahead({
					'source': bindingValue,
					'minLength': allBindings.minLength,
					//'item': allBindings.icon ? '<li><i class="fa fa-fw"></i><a href="#"></a></li>' : '<li><a href="#"></a></li>',
					'items': allBindings.items, //maxItems
					'matcher': allBindings.matcher,
					'sorter': allBindings.sorter,
					'updater': allBindings.updater,
					'autoSelect': allBindings.autoSelect,
					'showHintOnFocus': allBindings.showHintOnFocus,
					'scrollHeight': allBindings.scrollHeight
				})
			;
		}
	}
};

ko.bindingHandlers.datepicker = {
	//http://eternicode.github.io/bootstrap-datepicker/?markup=component&format=&weekStart=1&startDate=&endDate=&startView=0&minViewMode=0&todayBtn=linked&language=de&orientation=auto&multidate=&multidateSeparator=&daysOfWeekDisabled=0&daysOfWeekDisabled=6&calendarWeeks=on&autoclose=on&todayHighlight=on&keyboardNavigation=on&forceParse=on#sandbox
	init: function (element, valueAccessor, allBindingsAccessor) {
		require(['services/app'], function (app) {

			//initialize datepicker with some optional options
			var options = allBindingsAccessor().datepickerOptions || {
				format: "d.m.yyyy",
				weekStart: 1,
				startDate: new Date(),
				todayBtn: false,
				todayBtn: "linked",
				language: "de",
				multidateSeparator: ",",
				multidate: false,
				autoclose: true,
				todayHighlight: true
			};
			var value = valueAccessor();

			$(element)
				.datepicker(options)
				.datepicker('setDate', value())
			;

			//when a user changes the date, update the view model
			ko.utils.registerEventHandler(element, "changeDate", function (event) {
				var value = valueAccessor();
				if (ko.isObservable(value)) {
					//value(event.date);  //set time = 0:00
					var val = value();
					var time = val.getTime() - new Date(val.getFullYear(), val.getMonth(), val.getDate()).getTime();
					value(new Date(event.date.getTime() + time));
				}
			}); //registerEventHandler

		}); //require
	}, //init
	update: function(element, valueAccessor)   {
		var widget = $(element).data("datepicker");
		//when the view model is updated, update the widget
		if (widget) {
			widget.date = ko.utils.unwrapObservable(valueAccessor());
			if (widget.date) {
				widget.setValue();            
			}
		}
	}
};

ko.bindingHandlers.timeslider = {
	init: function (element, valueAccessor, allBindingsAccessor) {
		//initialize slider with some optional options
		var options = allBindingsAccessor().sliderOptions || {
			range: false,
			min: 0,
			max: 1435,
			step: 15,
			slide: onSlide
		};
		var value = valueAccessor();
		var val = value();
		$(element)
			.slider(options)
			.slider('option', 'value', (val.getHours() * 60) + val.getMinutes())
		;

		//when a user changes the date, update the view model
		function onSlide(e, ui) {
			var hours = Math.floor(ui.value / 60);
			var minutes = ui.value - (hours * 60);
			var val = value();
			val.setHours(hours);
			val.setMinutes(minutes);
			value(val);
		}
	},
	update: function (element, valueAccessor) {
		//when the view model is updated, update the widget
		var val = ko.utils.unwrapObservable(valueAccessor());
		$(element).slider('option', 'value', (val.getHours() * 60) + val.getMinutes());
	}
};

//#endregion form control bindings

//#region formatting

//add ko binding for Date using moment.js
ko.bindingHandlers.textDate = {
	init: function (element, valueAccessor, allBindingsAccessor) {
		var value = valueAccessor();
		var allBindings = allBindingsAccessor();
		var format = allBindings.format || 'DD.MM.YYYY HH:mm';
		$(element).change( function (event) {
			var text = $(this).val();
			try {
				var m = moment(text, format);
				var val = value();
				val.setHours(m.hour());
				val.setMinutes(m.minute());
				value(val);
			}
			catch (e) { }
		});
	},
	update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
		var value = ko.utils.unwrapObservable(valueAccessor());
		var allBindings = allBindingsAccessor();
		//Options
		var attributeName = allBindings.bindTo || 'text';
		var format = allBindings.format || 'DD.MM.YYYY HH:mm';
		//parse Date
		var date = value === null
						 ? null
						 : value.toString().substring(0, 2) === 'PT'
						 ? moment.fromPT(value)
						 : moment(value);
		if (date && date.isValid) {
			//format
			var dateString = date.format(format);
			//var dateString = date.calendar();
			if (attributeName === 'text') {
				$(element).text(dateString);
			}
			else {
				$(element).attr(attributeName, dateString);
			}
		}
		else {
			//todo trigger ko.validation
			if (attributeName === 'text') {
				$(element).text('');
			}
			else {
				$(element).attr(attributeName, null);
			}
		}
	}
};

//#endregion formatting

//#region Global Extensions


//Extension for moment to understand MS DateTime (actually time only) format
moment.fromPT = function (time) {
	if (!time) return null;
	var h = 0, m = 0, s = 0;
	var parts = time.replace(/PT/, '');
	if (parts.indexOf("H") > -1) {
		parts = parts.split("H");
		h = parseInt(parts[0], 10);
		parts = parts[1];
	}
	if (parts.indexOf("M") > -1) {
		parts = parts.split("M");
		m = parseInt(parts[0], 10);
		parts = parts[1];
	}
	if (parts.indexOf("S") > -1) {
		parts = parts.split("S");
		s = parseInt(parts[0], 10);
	}
	return moment().year(0).month(0).date(0).hour(h).minute(m).second(s);
};


//global method to chek js object type
var typeOf = (function (global) {
	var cache = {};
	return function (obj) {
		var key;
		return obj === null ? 'null' // null
				: obj === global ? 'global' // window in browser or global in nodejs
				: (key = typeof obj) !== 'object' ? key // basic: string, boolean, number, undefined, function
				: obj.nodeType ? 'object' // DOM element
				: cache[key = ({}).toString.call(obj)] // cached. date, regexp, error, object, array, math
				|| (cache[key] = key.slice(8, -1).toLowerCase()); // get XXXX from [object XXXX], and cache it
	};
}(this));

String.prototype.startsWith = function (prefix) {
	return this.indexOf(prefix) === 0;
}

String.prototype.endsWith = function (suffix) {
	return this.match(suffix + "$") == suffix;
};

//#endregion Global Extensions
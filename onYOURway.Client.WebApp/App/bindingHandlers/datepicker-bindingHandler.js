ko.bindingHandlers.datepicker = {
	//http://eternicode.github.io/bootstrap-datepicker/?markup=component&format=&weekStart=1&startDate=&endDate=&startView=0&minViewMode=0&todayBtn=linked&language=de&orientation=auto&multidate=&multidateSeparator=&daysOfWeekDisabled=0&daysOfWeekDisabled=6&calendarWeeks=on&autoclose=on&todayHighlight=on&keyboardNavigation=on&forceParse=on#sandbox
	//Apache-Licence -- TODO: replace with other datepicker
	init: function (element, valueAccessor, allBindingsAccessor) {
		require(['services/app'], function (app) {

			//initialize datepicker with some optional options
			var opt = allBindingsAccessor().datepickerOptions || "";
			var options = {
				format:				opt.format || "d.m.yyyy",
				weekStart:			opt.weekStart || 1,
				startDate:			opt.startDate || null,
				todayBtn:			opt.todayBtn || false,
				todayBtn:			opt.todayBtn || "linked",
				language:			opt.language || "en",
				multidateSeparator:	opt.multidateSeparator || ",",
				multidate:			opt.multidate || false,
				autoclose:			opt.autoclose || true,
				todayHighlight:		opt.todayHighlight || true
			};
			var value = valueAccessor();

			$(element)
				.datepicker(options)
				.datepicker('setDate', value())
			;

			//when a user changes the date, update the view model
			ko.utils.registerEventHandler(element, "changeDate", function (event) {
				var value = valueAccessor();
				//if (ko.isObservable(value)) {
				//value(event.date);  //set time = 0:00
				var val = ko.utils.unwrapObservable(value);
				var time = 0;
				if (val) {
					time = val.getTime() - new Date(val.getFullYear(), val.getMonth(), val.getDate()).getTime();
				}
				value(new Date(event.date.getTime() + time));
				console.log('[ datepicker-Bindinghandler | changeDate event ]',event);
				//}
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

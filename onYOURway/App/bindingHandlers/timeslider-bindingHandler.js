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

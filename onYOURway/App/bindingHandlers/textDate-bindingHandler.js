//ko binding for Date using moment.js
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
		// options
		var attributeName = allBindings.bindTo || 'text';
		var format = allBindings.format || 'DD.MM.YYYY HH:mm';
		// parse date
		var date = !value 
						 ? null
						 : value.toString().substring(0, 2) === 'PT'
							? moment.fromPT(value)
							: moment(value);
		if (date && date.isValid) {
			// format
			var dateString = '';
			if (format == 'fromNow') dateString = date.from(new Date());
			else dateString = date.format(format);
			// assign
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

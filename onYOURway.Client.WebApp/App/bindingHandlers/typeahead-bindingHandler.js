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

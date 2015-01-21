ko.bindingHandlers.places = {

	update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
		var options = valueAccessor();
		//console.log('[bindingHandlers] places binding update', viewModel, options.data);
		options.onDataChange(options.data());
	}

};

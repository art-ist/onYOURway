ko.bindingHandlers.map = {
	init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
		var options = valueAccessor();
		console.log('[bindingHandlers] map binding init', options);
		options.initialize(element.id);
	} //init
}; //map
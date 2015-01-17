﻿ko.bindingHandlers.ventures = {
	//init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
	//	var options = valueAccessor();
	//	console.log('[bindingHandlers] ventures binding init', options.data);
	//}, //init
	update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
		var options = valueAccessor();
		//console.log('[bindingHandlers] ventures binding update', viewModel, options.data);
		viewModel.location.removePointerAndDrawMarkers(options.data());
	} //update
}; //ventures
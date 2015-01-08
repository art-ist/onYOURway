//#region Binding Providers

(function () {

	//Catch binding exceptions using a custom binding provider
	//see: http://www.knockmeout.net/2013/06/knockout-debugging-strategies-plugin.html
	var existing = ko.bindingProvider.instance;

	ko.bindingProvider.instance = {
		nodeHasBindings: existing.nodeHasBindings,
		getBindings: function(node, bindingContext) {
			var bindings;
			try {
				bindings = existing.getBindings(node, bindingContext);
			}
			catch (ex) {
				if (window.console && console.log) {
					console.log("KO binding error: " + ex.message, node, bindingContext);
				}
			}
			return bindings;
		}
	};

})();

//#endregion Binding Providers



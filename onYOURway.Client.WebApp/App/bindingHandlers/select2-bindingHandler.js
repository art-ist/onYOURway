ko.bindingHandlers.select2 = {
	init: function (element, valueAccessor, allBindingsAccessor) {
		var obj = valueAccessor(),
			allBindings = allBindingsAccessor(),
			value = ko.utils.unwrapObservable(allBindings.value);

		//add: allowCreate
		if (obj.allowCreate && !obj.createSearchChoice) {
			obj.createSearchChoice = function (term) {
				return { id: term, text: term };
			}
		}

		//add: optionsUrl (but don't overwrite ajax)
		if (obj.optionsUrl && !obj.ajax) {
			obj.ajax = {
				url: obj.optionsUrl,
				dataType: 'json',
				quietMillis: 350,
				data: function (term, page) {
					return {
						q: term, // search term
					};
				},
				results: function (data, page) { // parse the results into the format expected by Select2.
					//if array of strings (see: http://jsperf.com/isempty-array-check and http://jsperf.com/check-if-var-is-string)
					if (data.length && (typeof data[0] === "string" || data[0] instanceof String)) {
						var res = [];
						for (var i = 0; i < data.length; i++) {
							res.push({ id: data[i], text: data[i] });
						}
						return { results: res };
					}
					//TODO: maybe detect if result doesen't contain id and convert Id or Key to id and Name or Title to text
					return { results: data };
				},
				cache: true
			}
		}

		//initialize select2
		$(element).select2(obj);

		if (allBindings.value) {
			$(element).select2('val', value);
		}

		//add: initialData
		if (obj.initialData) {
			$(element).select2('data', obj.initialData);
		}

		//add: observableData
		if (obj.observableData) {
			obj.observableData.subscribe(function (changes) {
				$(element).select2('data', obj.observableData());
			});
		}

		//add: on: [ { event: 'change', handler: function(e) {...} }, ... ]
		if (obj.on && obj.on.length) {  //array of event-handler-pairs
			for (var i = 0; i < obj.on.length; i++) {
				$(element).on(obj.on[i].event, obj.on[i].handler);
			}
		}

		//dispose
		ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
			$(element).select2('destroy');
		});

	}, //init
	update: function (element, valueAccessor, allBindingsAccessor) {
		var obj = valueAccessor(),
			allBindings = allBindingsAccessor(),
			value = ko.utils.unwrapObservable(allBindings.value);
		//console.log('[select2] change triggered', { value: value, v: allBindings.value, element: element, valueAccessor: valueAccessor, allBindingsAccessor: allBindingsAccessor });
		$(element).select2('val', value).trigger('change');

	} //update
};

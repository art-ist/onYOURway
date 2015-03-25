//localizable text and attr bindings

// Replace the text of an element with the message translation for the given key. 
ko.bindingHandlers['localText'] = {

	//if we need to make this more dynamic see: https://github.com/knockout/knockout/blob/master/src/binding/defaultBindings/text.js
	init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
		require(['services/app', 'services/tell'], function (app, tell) {

			var value = valueAccessor();
			var $element = $(element);

			var updateText = function () {
				var text = app.getMsg(value);
				//tell.log('updating', 'localText-binding');
				if (text) {
					$element.text(text);
				}
			};
			//call now
			updateText();
			//register to be called on changes (e.g. deferred data arrival or language change)
			$(app).on('messagesLoaded', updateText);

			//tell.log('initialized', 'localText-binding');
		}); //require
	} //init

};

// Replace the an arbitory attribute of an element with the message translation for the given key. 
// A typical usage would be to localize the title or placeholder attributes of an element.
// (based on the original knockout attr binding, see: https://github.com/knockout/knockout/blob/master/src/binding/defaultBindings/attr.js)
var attrHtmlToJavascriptMap = { 'class': 'className', 'for': 'htmlFor' };
ko.bindingHandlers['localAttr'] = {

	init: function (element, valueAccessor, allBindings) {
		require(['services/app'], function (app) {
			var value = ko.utils.unwrapObservable(valueAccessor()) || {};

			var updateAttr = function () {
				//iterate objects
				ko.utils.objectForEach(value, function (attrName, attrValue) {
					attrValue = ko.utils.unwrapObservable(attrValue);
					// To cover cases like "attr: { checked:someProp }", we want to remove the attribute entirely
					// when someProp is a "no value"-like value (strictly null, false, or undefined)
					// (because the absence of the "checked" attr is how to mark an element as not checked, etc.)
					var toRemove = (attrValue === false) || (attrValue === null) || (attrValue === undefined);
					if (toRemove)
						element.removeAttribute(attrName);
					// In IE <= 7 and IE8 Quirks Mode, you have to use the Javascript property name instead of the
					// HTML attribute name for certain attributes. IE8 Standards Mode supports the correct behavior,
					// but instead of figuring out the mode, we'll just set the attribute through the Javascript
					// property for IE <= 8.
					if (ko.utils.ieVersion <= 8 && attrName in attrHtmlToJavascriptMap) {
						attrName = attrHtmlToJavascriptMap[attrName];
						if (toRemove)
							element.removeAttribute(attrName);
						else
							element[attrName] = app.getMsg(attrValue);
					} else if (!toRemove) {
						element.setAttribute(attrName, app.getMsg(attrValue.toString()));
					}
					// Treat "name" specially - although you can think of it as an attribute, it also needs
					// special handling on older versions of IE (https://github.com/SteveSanderson/knockout/pull/333)
					// Deliberately being case-sensitive here because XHTML would regard "Name" as a different thing
					// entirely, and there's no strong reason to allow for such casing in HTML.
					if (attrName === "name") {
						ko.utils.setElementName(element, toRemove ? "" : app.getMsg(attrValue.toString()));
					}
				});
			}

			//call now
			updateAttr();
			//register to be called on changes (e.g. deferred data arrival or language change)
			$(app).on('messagesLoaded', updateAttr);

		}); //require
	} //init

};

// Set the elements text to the value of a givern viemodel property (just like the text binding) 
// but if the bindingcontet has a property called Localizations it tries to find an appropriate localization and uses its equally named property
ko.bindingHandlers['localizeableText'] = {

	update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
		require(['services/app', 'services/tell'], function (app, tell) {
			var value = ko.utils.unwrapObservable(valueAccessor());
			var allBindings = allBindingsAccessor();
			//tell.log('updating', 'localizeableText-binding', { element: element, valueAccessor: valueAccessor, allBindingsAccessor: allBindingsAccessor, viewModel: viewModel, bindingContext: bindingContext });
			var lang = allBindings.langFrom || app.lang();
			$(element).text(value);
		});
	}

};
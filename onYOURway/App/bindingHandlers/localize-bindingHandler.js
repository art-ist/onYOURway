//localizable text and attr bindings

// replace the text of an element with the message translation for the given key. 
ko.bindingHandlers['localText'] = {

	//if we need to make this more dynamic see: https://github.com/knockout/knockout/blob/master/src/binding/defaultBindings/text.js
	init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
		require(['services/app'], function (app) {

			var value = valueAccessor();
			var $element = $(element);

			var updateText = function () {
				var text = app.getMsg(value)
				if (text) {
					$element.text(text);
				}
			};

			updateText();

			$(app).on('messagesLoaded', updateText);

		}); //require
	} //init

};

//based on the original knockout attr binding (see: https://github.com/knockout/knockout/blob/master/src/binding/defaultBindings/attr.js)
var attrHtmlToJavascriptMap = { 'class': 'className', 'for': 'htmlFor' };
ko.bindingHandlers['localAttr'] = {

	update: function (element, valueAccessor, allBindings) {
		require(['services/app'], function (app) {
			var value = ko.utils.unwrapObservable(valueAccessor()) || {};

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
		}); //require
	} //init

};
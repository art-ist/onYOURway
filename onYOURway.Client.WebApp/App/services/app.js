﻿/// <reference path="../../Scripts/jsts.js" />
/// <reference path="../../Scripts/leaflet-0.5.1.js" />
/// <reference path="../../Scripts/knockout-3.0.0.js" />
/// <reference path="logger.js" />

define([
  'services/location',
  'services/logger',
  'services/tell',
  'services/platform',
  'services/auth',
  'services/storage',
  'plugins/router'
], function (location, logger, tell, platform, auth, storage, router) {

	//create global viewModel
	var app = {

		initialize: initialize,

		//simple properties
		title: 'onYOURway',
		lang: ko.observable('de'),
		langs: [
			{ id: 'de', name: 'Deutsch' },
			{ id: 'en', name: 'English' },
			{ id: 'fr', name: 'Français' },
			{ id: 'it', name: 'Italiano' },
			{ id: 'es', name: 'Español' },
		],
		setLang: setLang,

		msg: null /* messages (translations texts) - will be initialized on load */,
		getMsg: getMessage,
		tryMsg: getMessage, //tryGetMessage,

		location: location,
		auth: auth,
		storage: storage,

		when: location.when,
		canLocate: navigator.geolocation.getCurrentPosition, //Function available?

		//observable properties
		tools: {
			search: ko.observable(false),
			locationList: ko.observable(false),
			shoppingList: ko.observable(false),
			locationDetails: ko.observable(false),

			toggleSearch: function () {
				var search = app.tools.search;
				search(!search());
			}
		},

		user: {
			Name: ko.observable(null),
			isAuthenticated: ko.observable(false),
			//accessToken: null,
			//rememberMe: ko.observable(null),
			navigateToLoggedIn: navigateToLoggedIn,
			ventures: ko.observableArray() //TODO: get 'owned' ventures
		},

		settings: {
			mapBackground: true,
			animationDuration: 500,
			location: location.settings //aggregate location settings in app settings
		},

		shoppingList: {
			items: ko.observableArray([]),
			itemsTodo: function () { return ko.computed(getShoppingListTodoCount, app.shoppingList.items(), { deferEvaluation: true }); },

			addItem: addShoppingListItem,
			findItem: function () { location.search(this.Title()); },
			removeItem: removeShoppingListItem,
			clean: cleanShoppingList
		},

		navigateInPage: navigateInPage

	};
	return app;

	//#region localization

	function loadMessages() {
		var readManager = new breeze.EntityManager({
			dataService: new breeze.DataService({
				serviceName: config.host + '/api/locate'
			, hasServerMetadata: false  // never ask the server for metadata (we don not want this manager to mengle json data into any metadata based object types)
			}),
		});
		var q = new breeze.EntityQuery().from('Messages');
		if (app.lang()) {
			q = q.withParameters({ lang: app.lang() });
		}
		//tell.start('App - Loading Messages');
		return readManager.executeQuery(q)
			.then(function (data) {
				app.msg = data.results[0];
				//tell.done('App - Loading Messages');
				$(app).trigger('messagesLoaded');
				// configure breeze client side validation messages (used as fallback by the breezeValidation-bindingHandler, if no error.validation[key] message is found)
				if (app.msg && app.msg.error && app.msg.error.breeze && breeze && breeze.Validator && breeze.Validator.messageTemplates) {
					$.each(app.msg.error.breeze, function (key, val) {
						if (key && val && key.indexOf('$') !== 0) {
							breeze.Validator.messageTemplates[key] = val;
						}
					});
				}
			})
			.fail(function (e) {
				//tell.error('Loading messages failed', 'App', e, 'App - Loading Messages');
			});
		;
	}

	//helper function to drill down into an object hierarchy, returning null if any property doesnt exist
	function drill(obj, key) {
		if (!obj) {
			return null;
		} else {
			var val = obj[key];
			if (val) {
				return val;
			} else {
				var idx = key.indexOf('.');
				return idx < 0 ? null : drill(obj[key.substr(0, idx)], key.substr(idx + 1));
			}
		}
	}

	//helper function to format a message "{0} + {1} = {2}" by inserting the provided variables (1,2,3): "1 + 2 = 3"
	function formatMessage(message, replacements) {
		return message && message.replace(/\{(\d+)\}/g, function () {
			return replacements[arguments[1]];
		});
	}

	////return a translated message by key
	////the parameter keys can eiter be a string or and array of two strings
	////if no message for this key found, returns ???keys???
	//function getMessage(keys, variableValues, obj) {
	//    return tryGetMessage(keys, variableValues, obj) || ('???' + keys + '???');
	//}

	//return a translated message by key
	//the parameter keys can eiter be a string or an array of two strings or an array of two strings and another array of variableValues
	//the parameter variableValues is an array of all required variable values for this messages placeholders ({0} ... {9})
	//if no message for this key found, returns null
	function getMessage(keys, variableValues, obj) {
		var result = null;
		if (typeof keys === 'string') {
			result = variableValues
				? formatMessage(drill(obj || app.msg, keys), variableValues)
				: drill(obj || app.msg, keys);
		} else {
			result = (variableValues || keys[2])
				? formatMessage(drill(drillobj || (app.msg, keys[0]), keys[1]), variableValues || keys[2])
				: drill(drill(obj || app.msg, keys[0]), keys[1]);
		}
		//log message if key not found
		if (!result) {
			tell.log("app.getMessage could not find message for key '" + keys + "'", 'app localization');
		}
		return result;
	}

	//set app language (causing message reload)
	function setLang(langId) {
		tell.log('setting lang to ' + langId);
		app.lang(langId);

		loadMessages();
		location.loadRegionFeatures();

		return false;
	}

	//#endregion localization

	function initialize() {
		tell.log('app initializing', 'app');

		loadMessages();

		//load shopping list
		loadShoppingList();
	}

	function navigateToLoggedIn(userName, access_token, rememberMe) {
		var user = app.user;
		user.isAuthenticated(true);
		user.Name(userName);
		//user.accessToken(access_token);
		//user.rememberMe(rememberMe);
		router.navigate('#/')
	}

	function navigateInPage(afterNavigate) {
		//set event handler
		$('.oyw-content-nav a').click(onNavClick);

		function onNavClick(data, event) {
			var href = $(this).attr('href');
			if (href.startsWith('#/') || href.startsWith('.') || href.startsWith('/') || href.startsWith('http:')) return true; //leave these to default action
			var target = $(href);
			if (target) $('.oyw-content-main').scrollTo(target, { offset: 0, duration: app.settings.animationDuration });

			//TODO: replace with scrollspy
			$('.oyw-content-nav .active').removeClass('active')
			$(this).parent('li').addClass('active');

			if (afterNavigate) {
				afterNavigate(href, target);
			}
			return false; //prevent default action
		} //onNavClick

	} //navigateInPage

	//#region ShoppingList

	function addShoppingListItem(item, saveList) {
		tell.log('adding Item ' + item.Title(), 'app.shoppingList');
		app.shoppingList.items.push(item);
		if (saveList !== false) { //only when explicitly set to false (default = save)
			saveShoppingList();
		}
		item.Done.subscribe(saveShoppingList); //AutoSave List
		item.Done.subscribe(saveShoppingList); //AutoSave List
	}

	function removeShoppingListItem(item) {
		tell.log('removing Item ' + item.Title(), 'app.shoppingList');
		app.shoppingList.items.remove(item);
		saveShoppingList();
	}

	function cleanShoppingList() {
		tell.log('cleaning List', 'app.shoppingList');
		app.shoppingList.items.remove(function (item) { return item.Done(); }); //removes all done items
		saveShoppingList();
	}

	function getShoppingListTodoCount() {
		var result = 0;
		var items = this;
		for (var i = 0; i < items.length; i++) {
			if (!items[i].Done()) result++;
		}
		return result;
	}

	function loadShoppingList() {
		//app.storage.clear();

		//load locally stored data
		app.storage.load('shoppingList', function (value) {
			//if nothing found use empty array
			if (!value) value = [];
			var _item = null;
			for (var i = 0; i < value.length; i++) {
				_item = ko.mapping.fromJS(value[i]);
				app.shoppingList.addItem(_item, false);
			}
			//if (value) ko.mapping.fromJSON(value, app.shoppingList);
			//tell.log('list loaded', 'shoppingList', app.shoppingList.items());
		});
	}

	function saveShoppingList() {
		app.storage.save('shoppingList', ko.toJS(app.shoppingList.items()));
		//app.storage.save('shoppingList', ko.mapping.toJSON(app.shoppingList));
		tell.log('shoppingList saved', 'shoppingList', app.shoppingList.items().length);
	}

	//#endregion ShoppingList

});

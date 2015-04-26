/// <reference path="../../Scripts/jsts.js" />
/// <reference path="../../Scripts/leaflet-0.5.1.js" />
/// <reference path="../../Scripts/knockout-3.3.0.js" />

define([
	'services/platform',
	'services/tell',
	'services/auth',
	'services/localStorage',
	'plugins/router',
	'services/locate',
	'services/taxonomy',
    'services/translation'
], function (platform, tell, auth, localStorage, router, locate, taxonomy, translation) {

	//create global viewModel
	var app = {

		initialize: initialize,

		//simple properties
		title: 'onYOURway',

		lang: translation.lang,
		langs: translation.langs,
		setLang: setLang,

		msg: translation.msg,
		getMsg: translation.getMsg,
		tryMsg: translation.getMsg, //tryGetMessage,

		//TODO: change all finish the renaming of the location service to locate service to avoid confusion with window.location and to increase alignment with service API
		locate: locate,
		location: locate,	//TODO: remove this
		auth: auth,
		localStorage: localStorage,

		when: locate.when,
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
			location: locate.settings //aggregate locate settings in app settings
		},

		shoppingList: {
			items: ko.observableArray([]),
			itemsTodo: function () { return ko.computed(getShoppingListTodoCount, app.shoppingList.items(), { deferEvaluation: true }); },

			addItem: addShoppingListItem,
			findItem: function () { locate.search(this.Title()); },
			removeItem: removeShoppingListItem,
			clean: cleanShoppingList
		},

		navigateInPage: navigateInPage

	};
	return app;

	//set app language (causing message reload)
	function setLang(langId) {
        translation.setLang(langId);
		locate.loadRegionFeatures();
		return false;
	}

	//#endregion localization

	//read a value from app.config.js based on key string (if the same value exists in a realm config, the realm specific setting wins)
	function getConfigValue(key) {
		try {
			var val;
			val = eval('config.' + realm + '.' + key);
			if (typeof val != 'undefined') return val;
			return eval('config.' + key);
		} catch (e) {
			return eval('config.' + key);
		}
	}

	function initialize() {
		tell.log('app initializing', 'app');

		config.get = getConfigValue;
		window.oyc = app;	//TODO: replace with scripting- (or console-) API implemented as service

		translation.loadMessages();
		initializeLocateService();

		//load shopping list
		if (config.get('features.shoppingList')) {
			loadShoppingList();
		}

	}

	//#region initialization

	function initializeLocateService() {
		//get realm based on key 'realm' in app.config.js
		if (config.realm) {
			//tell.log('setting realm', 'app', config.realm);
			locate.initialize(config.realm, app.lang);
		}
		//if not configured, get realm based on current window.location
		else {
			tell.log('getting realm info for ' + window.location,  'app');
			$.get(config.host + '/locate/GetRealmKey?Uri=' + window.location, function (data) {
				locate.initialize(data, app.lang);
			});
		}
	} //setRealm

	//#endregion initialization

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
		//app.localStorage.clear();

		//load locally stored data
		app.localStorage.load('shoppingList', function (value) {
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
		app.localStorage.save('shoppingList', ko.toJS(app.shoppingList.items()));
		//app.localStorage.save('shoppingList', ko.mapping.toJSON(app.shoppingList));
		tell.log('shoppingList saved', 'shoppingList', app.shoppingList.items().length);
	}

	//#endregion ShoppingList

});


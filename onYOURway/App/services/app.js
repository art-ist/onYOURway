/// <reference path="../../Scripts/jsts.js" />
/// <reference path="../../Scripts/leaflet-0.5.1.js" />
/// <reference path="../../Scripts/knockout-3.0.0.js" />
/// <reference path="logger.js" />

define([
  'services/location',
  'services/logger',
  'services/platform',
  'services/auth' ,
  'services/storage' ,
  'plugins/router'
], function (location, logger, platform, auth, storage, router) {

  //create global viewModel
  var app = {

    initialize: initialize,

    //simple properties
    title: 'onYOURway',
    lang: 'de',

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

  function initialize(){
    logger.log('app initializing', '_app');

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
      if(target) $('.oyw-content-main').scrollTo(target, { offset: 0, duration: app.settings.animationDuration });

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
    logger.log('adding Item ' + item.Title(), 'app.shoppingList');
    app.shoppingList.items.push(item);
    if (saveList !== false) { //only when explicitly set to false (default = save)
      saveShoppingList();
    }
    item.Done.subscribe(saveShoppingList); //AutoSave List
    item.Done.subscribe(saveShoppingList); //AutoSave List
  }

  function removeShoppingListItem(item) {
    logger.log('removing Item ' + item.Title(), 'app.shoppingList');
    app.shoppingList.items.remove(item);
    saveShoppingList();
  }

  function cleanShoppingList() {
    logger.log('cleaning List', 'app.shoppingList');
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
      //logger.log('list loaded', 'shoppingList', app.shoppingList.items());
    });
  }

  function saveShoppingList() {
    app.storage.save('shoppingList', ko.toJS(app.shoppingList.items()));
    //app.storage.save('shoppingList', ko.mapping.toJSON(app.shoppingList));
    logger.log('shoppingList saved', 'shoppingList', app.shoppingList.items().length);
  }

  //#endregion ShoppingList

});


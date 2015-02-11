define([
  'services/tell',
  'services/app'
], function (tell, app) {

  function Item(title) {
    var self = this;
    self.Title = ko.observable(title);
    self.Venture = ko.observable(null);
    self.Done = ko.observable(false);
  }

  var vm = {
    app: app,
    title: 'Einkaufsliste',

    //activate: function (vm) {
    //  tell.log('View activated', 'shoppingList');
    //  return true;
    //},

    //deactivate: function () {
    //}

    attached: function () {
      $('#inputNewItem').focus(); //set focus to input for next new item
    },

    //properties
    items: app.shoppingList.items,
    itemsTodo: app.shoppingList.itemsTodo,
    newItem: ko.observable(new Item()),

    //methods
    addItem: function (item) {
      app.shoppingList.addItem(item);
      vm.newItem(new Item()); //clear the newItem
      $('#inputNewItem').focus(); //set focus to input for next new item
    },
    toggleDone: function (item) {
      item.Done(!item.Done());
    },
    findItem: app.shoppingList.findItem,
    removeItem: app.shoppingList.removeItem,
    cleanList: app.shoppingList.clean

  };
  return vm;

}); //define
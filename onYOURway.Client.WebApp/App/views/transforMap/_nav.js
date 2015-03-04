define([
  'services/app',
  'services/locate',
  'services/tell',
], function (app, locate, tell) {

  var vm = {
    self: this,
    app: app,
    locate: locate,
    shoppingList: app.shoppingList,

    //activate: function () {
    //  tell.log('View activated', '_nav');
    //},

    //attached: function () {
    //  return true;
    //},

    search: function () {
      //app.tools.search(false);  //hide search panel
      locate.search(locate.searchFor());
    },
    test: function () {
      locate.editlocate(138);
    }

  };
  return vm;

}); //define

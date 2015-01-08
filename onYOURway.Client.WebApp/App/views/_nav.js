define([
  'services/app',
  'services/location',
  'services/logger',
  //'bootstrap',
  'knockout'
], function (app, location, logger, bootstrap) {

  var vm = {
    self: this,
    app: app,
    location: location,
    shoppingList: app.shoppingList,

    //activate: function () {
    //  logger.log('View activated', '_nav');
    //},

    //attached: function () {
    //  $('#searchFor').typeahead(null, {
    //    displayKey: 'Name',
    //    source: anExcitedSource
    //  });
    //  return true;
    //},

    search: function () {
      //app.tools.search(false);  //hide search panel
      location.search(location.searchFor());
    },
    test: function () {
      location.editLocation(138);
    }

    ////#region typeahead search
    //match: function (item) {
    //  return ko.utils.unwrapObservable(item).toLowerCase().indexOf(this.query.toLowerCase());
    //},
    //sort: function (items) {
    //  var beginswith = []
    //  , caseSensitive = []
    //  , caseInsensitive = []
    //  , item;
    //  while ((item = ko.utils.unwrapObservable(items.shift()))) {
    //    if (!item.toLowerCase().indexOf(this.query.toLowerCase())) beginswith.push(item);
    //    else if (~item.indexOf(this.query)) caseSensitive.push(item);
    //    else caseInsensitive.push(item);
    //  }
    //  return beginswith.concat(caseSensitive, caseInsensitive);
    //},
    //highlight: function (item) {
    //  var query = this.query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
    //  return ko.utils
    //    .unwrapObservable(item)
    //    .replace(new RegExp('(' + query + ')', 'ig'), function ($1, match) {
    //      return '<strong>' + match + '</strong>';
    //    });
    //},
    //render: function (items) {
    //  var that = this;
    //  items = $(items).map(function (i, item) {
    //    i = $(that.options.item).data('value', item);
    //    i.find('i').html('fa-shopping-cart');
    //    i.find('a').html(that.highlighter(item));
    //    logger.log(i, 'XXXXXX');
    //    return i[0];
    //  });
    //  if (this.autoSelect) {
    //    items.first().addClass('active');
    //  }
    //  this.$menu.html(items);
    //  return this;
    //}
    ////#endregion typeahead search

  };
  return vm;

}); //define

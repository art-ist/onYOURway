define([
  'services/app',
  'services/location',
  'services/logger',
  //'bootstrap',
  'knockout'
], function (app, location, logger, ko) {

    ko.bindingHandlers.select2 = {
        init: function (element, valueAccessor, allBindingsAccessor) {
            var obj = valueAccessor(),
                allBindings = allBindingsAccessor(),
                lookupKey = allBindings.lookupKey;
            $(element).select2(obj);
            if (lookupKey) {
                var value = ko.utils.unwrapObservable(allBindings.value);
                $(element).select2('data', ko.utils.arrayFirst(obj.data.results, function (item) {
                    return item[lookupKey] === value;
                }));
            }

            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                $(element).select2('destroy');
            });
        },
        update: function (element) {
            $(element).trigger('change');
        }
    };


  var vm = {
    self: this,
    app: app,
    location: location,
    shoppingList: app.shoppingList,
    suggestQuery: function (query) {
        if (query && query.term) {
            var s = location.searchSuggestions();
            var data = [];
            var data2 = [];
            var i;
            for (i = 0; i < s.length; i++) {
                if (s[i]) {
                    var idx = s[i].toLowerCase().indexOf(query.term.toLowerCase());
                    if (idx == 0) {
                        data.push({ id: s[i], text: s[i] });
                    } else if (idx > 0) {
                        data2.push({ id: s[i], text: s[i] });
                    }
                }
            }
            for (i = 0; i < data2.length; i++) {
                data.push(data2[i]);
            }
            query.callback({ results: data });
        }
    },

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

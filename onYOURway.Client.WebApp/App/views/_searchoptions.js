/// <reference path="../services/app.js" />
/// <reference path="../services/platform.js" />
define([
  'services/app',
  'services/location',
  'services/tell',
  'services/platform'
], function (app, location, tell, platform) {

  var vm = function () {
    var self = this;
    self.title = 'Entdecken';
    self.app = app;
    self.location = location;

    //self.attached = function () {
    //};

    self.where = ko.computed(function () {
      if (location.route.end.coords()) {
        return 'auf dem Weg';
      }
      else if (location.route.start.coords()) {
        return 'in der Nähe';
      }
      else {
        return 'egal';
      }
    });

    self.featureToAdd = ko.observable();

    self.toggleFeature = function (item) {
      item.Selected(!item.Selected());
    };

    self.addFeature = function (item) {
      var list = location.featuredIf();
      for (var i = 0; i < list.length; i++) {
        if (list[i].Name() === item) {
          //item already there -> select
          list[i].Selected(true);
          return;
        }
      } //for
      location.featuredIf.push( { Name: ko.observable(item), Selected: new ko.observable(true) } );
    };

    self.removeFeature = function (item) {
      item.Selected(false);               //unselect item
      location.featuredIf.remove(item);   //remove from list
    };

  };
  return vm;

}); //module
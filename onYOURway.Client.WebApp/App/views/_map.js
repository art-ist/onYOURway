define([
  'services/app',
  'services/location',
  'services/tell',
  'services/platform'
], function (app, location, tell, platform) {

  var vm = function () {
    var self = this;
    self.app = app;
    self.location = location;

    //#region lifecycle events

    //self.activate = function () {
    //  tell.log('[Map] View activated', self.title);
    //  return true;
    //};

    //self.attached = function () {
    //  tell.log('View attached', 'Map', $('#map'));
    //  //if (!location.map) {
    //  //  self.location.initializeMap('map');
    //  //}
    //};

    //#endregion lifecycle events

    //#region control display of map-parts

    //#region Properties

    self.showMap = ko.computed(function () {
      if (location.settings.showMap() === 'auto') {
        return true;
      }
      else {
        return location.settings.showMap();
      }
    });

    self.showList = ko.computed(function () {
      if (location.showSiteCollector) {
        return false;
      }
      if (location.settings.showList() === 'auto') {
        return (location.mapLocations().length > 0);
      }
      else {
        return location.settings.showList();
      }
    });

    self.showDetails = ko.computed(function () {
      if (location.showSiteCollector) {
          return false;
      }
      if (location.settings.showDetails() === 'auto') {
        return (location.selectedItem());
      }
      else {
        return location.settings.showDetails();
      } 
    });

    self.showSiteCollector = location.settings.showSiteCollector;

    //#endregion Properties

    //#endregion control display of map-parts

  };
  return vm;

}); //module
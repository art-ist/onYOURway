define([
  'services/app',
  'services/locate',
  'services/tell',
  'services/platform'
], function (app, locate, tell, platform) {

  var vm = function () {
    var self = this;
    self.app = app;
    self.locate = locate;

    //#region lifecycle events

    //self.activate = function () {
    //  tell.log('[Map] View activated', self.title);
    //  return true;
    //};

    //self.attached = function () {
    //  tell.log('View attached', 'Map', $('#map'));
    //  //if (!locate.map) {
    //  //  self.locate.initializeMap('map');
    //  //}
    //};

    //#endregion lifecycle events

    //#region control display of map-parts

    //#region Properties

    self.showMap = ko.computed(function () {
      if (locate.settings.showMap() === 'auto') {
        return true;
      }
      else {
        return locate.settings.showMap();
      }
    });

    self.showList = ko.computed(function () {
      if (locate.showSiteCollector) {
        return false;
      }
      if (locate.settings.showList() === 'auto') {
        return (locate.mapLocations().length > 0);
      }
      else {
        return locate.settings.showList();
      }
    });

    self.showDetails = ko.computed(function () {
      if (locate.showSiteCollector) {
          return false;
      }
      if (locate.settings.showDetails() === 'auto') {
        return (locate.selectedItem());
      }
      else {
        return locate.settings.showDetails();
      } 
    });

    self.showSiteCollector = locate.settings.showSiteCollector;

    //#endregion Properties

    //#endregion control display of map-parts

  };
  return vm;

}); //module
define([
  'services/app',
  'services/location',
  'services/logger',
  'services/platform'
], function (app, location, logger, platform) {

  var vm = function () {
    var self = this;
    self.app = app;
    self.location = location;

    //#region lifecycle events

    //self.activate = function () {
    //  logger.log('[Map] View activated', self.title);
    //  return true;
    //};

    //self.attached = function () {
    //  logger.log('View attached', 'Map', $('#map'));
    //  //if (!location.map) {
    //  //  self.location.initializeMap('map');
    //  //}
    //};

    //#endregion lifecycle events

    //#region control display of map-parts

    //#region Properties

    self.showMap = true;

    self.showList = false;

    self.showDetails = false;

    //#endregion Properties

    //#endregion control display of map-parts

  };
  return vm;

}); //module
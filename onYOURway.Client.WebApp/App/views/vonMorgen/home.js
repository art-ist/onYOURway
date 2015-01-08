/// <reference path="../../Scripts/r.js" />
define([
  'services/app',
  'services/location',
  'services/logger'
], function (app, location, logger, platform) {

  var vm = function () {
    var self = this;
    self.app = app;
    self.location = location;

    self.activate = function (queryString) {
      logger.log('activate', 'discover', queryString);
      if (queryString && queryString.tag) {
        location.showByTagName(queryString.tag);
      }
      return true;
    };
  };
  return vm;

}); //module
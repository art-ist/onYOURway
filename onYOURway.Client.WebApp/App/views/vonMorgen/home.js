/// <reference path="../../Scripts/r.js" />
define([
  'services/app',
  'services/locate',
  'services/tell'
], function (app, location, tell, platform) {

  var vm = function () {
    var self = this;
    self.app = app;
    self.location = location;

    self.activate = function (queryString) {
      tell.log('activate', 'discover', queryString);
      if (queryString && queryString.tag) {
        location.showByTagName(queryString.tag);
      }
      return true;
    };
  };
  return vm;

}); //module
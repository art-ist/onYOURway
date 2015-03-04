/// <reference path="../../Scripts/r.js" />
define([
  'services/app',
  'services/locate',
  'services/tell'
], function (app, locate, tell, platform) {

  var vm = function () {
    var self = this;
    self.app = app;
    self.locate = locate;

    self.activate = function (queryString) {
      tell.log('activate', 'discover', queryString);
      if (queryString && queryString.tag) {
        locate.showByTagName(queryString.tag);
      }
      return true;
    };
  };
  return vm;

}); //module
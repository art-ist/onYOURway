define([
  'services/logger',
  'services/app',
  'services/auth'
], function (logger, app, auth) {

  var vm = function () {
    var self = this;

    self.app = app;

    //activate = function () {
    //  return true;
    //};

    //// UI state

    //// Data
    self.location = ko.observable();

    //// Operations

  };
  return vm;

}); //define
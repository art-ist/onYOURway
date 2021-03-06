﻿/// <reference path="../services/app.js" />
/// <reference path="../services/platform.js" />
define([
  'services/app',
  'services/locate',
  'services/tell',
  'services/platform'
], function (app, location, tell, platform) {

  var vm = function () {
    var self = this;
    self.title = 'Entdecken';
    self.app = app;
    self.location = location;

    search = function () {
      location.search(location.searchFor());
    };

  };
  return vm;

}); //module
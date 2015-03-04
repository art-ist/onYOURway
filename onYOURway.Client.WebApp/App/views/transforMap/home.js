define([
    'plugins/router'
], function (router) {

  var vm = function () {
    var self = this;

    self.activate = function (queryString) {
      return true;
    };

    self.openMap = function() {
        router.navigate('#map');
    }

  };
  return vm;

});

define([
  'services/logger',
  'services/app'
],
  function (logger, app) {

  var vm = {
    self: this,
    app: app,
    title: null,

    activate: function () {
      logger.log('View activated', 'home');

      return true;
    }

  };
  return vm;

}); //define
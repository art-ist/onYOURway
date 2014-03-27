define([
  'services/logger',
  'services/app'
],
  function (logger, app) {

  var vm = {
    self: this,
    app: app,
    title: 'Privacy'

  };
  return vm;

}); //define
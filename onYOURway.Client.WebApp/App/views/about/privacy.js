define([
  'services/tell',
  'services/app'
],
  function (tell, app) {

  var vm = {
    self: this,
    app: app,
    title: 'Privacy'

  };
  return vm;

}); //define
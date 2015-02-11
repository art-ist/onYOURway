define([
  'services/tell',
  'services/app'
],
  function (tell, app) {

  var vm = {
    self: this,
    app: app,
    title: null,

    activate: function () {
      tell.log('View activated', 'home');

      return true;
    }

  };
  return vm;

}); //define
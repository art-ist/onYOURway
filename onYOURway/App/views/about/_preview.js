define([
  'services/logger',
  'services/app'
], function (logger, app) {

  var vm = {
    self: this,
    app: app,
    title: 'Public Preview',

    email: 'info[at]onYOURway[dot]at'.replace('[at]', '@').replace('[dot]', '.'),
    emailUrn: 'mehlto:'.replace('mehl', 'mail') + self.email

  };
  return vm;

}); //define
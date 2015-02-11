define([
  'services/tell',
  'services/app'
], function (tell, app) {

  var vm = {
    self: this,
    app: app,
    title: 'Public Preview',

    email: 'info[at]onYOURway[dot]at'.replace('[at]', '@').replace('[dot]', '.'),
    emailUrn: 'mehlto:'.replace('mehl', 'mail') + self.email

  };
  return vm;

}); //define
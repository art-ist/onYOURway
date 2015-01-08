define([
  'services/logger',
  'services/app',
  'services/auth'
], function (logger, app, auth) {

  var vm = function () {
    // Private state
    var self = this;

    self.app = app;
    //self.title = 'Registrierung';

    //activate = function () {
    //  return true;
    //};

    // UI state
    self.registering = ko.observable(false);
    self.externalAccessToken = null;
    self.state = null;
    self.loginUrl = null;
    self.errors = ko.observableArray();
    self.validationErrors = ko.validation.group([self.userName]);

    // Data
    self.loginProvider = ko.observable();
    self.userName = ko.observable(null).extend({ required: true });

    // data-bind click
    self.register = function () {
      self.errors.removeAll();

      if (self.validationErrors().length > 0) {
        self.validationErrors.showAllMessages();
        return;
      }

      self.registering(true);
      auth.registerExternal(self.externalAccessToken, {
        userName: self.userName()
      }).done(function (data) {
        sessionStorage["state"] = self.state;
        // IE doesn't reliably persist sessionStorage when navigating to another URL. Move sessionStorage
        // temporarily to localStorage to work around this problem.
        app.archiveSessionStorageToLocalStorage();
        window.location = self.loginUrl;
      }).failJSON(function (data) {
        var errors;

        self.registering(false);
        errors = auth.toErrorsArray(data);

        if (errors) {
          self.errors(errors);
        } else {
          self.errors.push("An unknown error occurred.");
        }
      });
    };

  };
  return vm;

}); //define
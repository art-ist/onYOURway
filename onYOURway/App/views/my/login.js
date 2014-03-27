define([
  'services/app',
  'services/auth',
  'services/logger'
], function (app, auth, logger) {

  var vm = function () {
    // Private state
    var self = this;
    var validationTriggered = ko.observable(false);

    // Private operations
    function initialize() {
      auth.getExternalLogins(auth.returnUrl, true /* generateState */)
          .done(function (data) {
            self.loadingExternalLogin(false);
            if (typeof (data) === "object") {
              for (var i = 0; i < data.length; i++) {
                self.externalLoginProviders.push(new ExternalLoginProviderViewModel(app, data[i]));
              }
            } else {
              self.errors.push("An unknown error occurred.");
            }
          }).fail(function () {
            self.loadingExternalLogin(false);
            self.errors.push("An unknown error occurred.");
          });
    }

    // Durandal page lifecycle events
    self.activate = function () {
      logger.log('View activated', self.title);
      return true;
    };

    // Data
    self.app = app;
    //self.user = auth;

    self.userName = ko.observable("").extend({ required: true });
    self.password = ko.observable("").extend({ required: true });
    self.rememberMe = ko.observable(false);
    self.externalLoginProviders = ko.observableArray();
    self.validationErrors = ko.validation.group([self.userName, self.password]);

    // Other UI state
    self.errors = ko.observableArray();
    self.loadingExternalLogin = ko.observable(true);
    self.loggingIn = ko.observable(false);

    self.hasExternalLogin = ko.computed(function () {
      return self.externalLoginProviders().length > 0;
    });

    // Operations
    self.login = function () {
      self.errors.removeAll();

      if (self.validationErrors().length > 0) {
        self.validationErrors.showAllMessages();
        return;
      }

      self.loggingIn(true);

      auth.login({
        grant_type: "password",
        username: self.userName(),
        password: self.password()
      }).done(function (data) {
        self.loggingIn(false);

        if (data.userName && data.access_token) {
          app.user.navigateToLoggedIn(data.userName, data.access_token, self.rememberMe());
        } else {
          self.errors.push("An unknown error occurred.");
        }
      }).fail(function (jqXHR, textStatus, errorThrown) {
        self.loggingIn(false);

        if (jqXHR && jqXHR.error_description) {
          self.errors.push(data.error_description);
        }
        else if(textStatus) {
          self.errors.push(textStatus);
        }
        else {
          self.errors.push("An unknown error occurred.");
        }
      });
    };

    initialize();

  }; //vm
  return vm;

  function ExternalLoginProviderViewModel(app, data) {
    var self = this;

    // Data
    self.name = ko.observable(data.name);

    // Operations
    self.login = function () {
      sessionStorage["state"] = data.state;
      sessionStorage["loginUrl"] = data.url;
      // IE doesn't reliably persist sessionStorage when navigating to another URL. Move sessionStorage temporarily
      // to localStorage to work around this problem.
      app.archiveSessionStorageToLocalStorage();
      window.location = data.url;
    };
  }

}); //module
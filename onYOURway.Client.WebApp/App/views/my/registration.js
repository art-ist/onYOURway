define([
  'services/tell',
  'services/app',
  'services/auth'
], function (tell, app, auth) {

	var vm = function () {
		var self = this;

		self.app = app;
		//self.title = 'Registrierung';

		//activate = function () {
		//  return true;
		//};

		self.email = 'info[at]onYOURway[dot]at'.replace('[at]', '@').replace('[dot]', '.');
		self.emailUrn = 'mehlto:'.replace('mehl', 'mail') + self.email;

		// UI state
		self.registering = ko.observable(false);
		self.errors = ko.observableArray();
		self.validationErrors = ko.validation.group([self.userName, self.password, self.confirmPassword]);

		// Data
		self.userName = ko.observable("").extend({ required: true });
		self.email = ko.observable("").extend({ required: true });
		self.password = ko.observable("").extend({ required: true });
		self.confirmPassword = ko.observable("").extend({ required: true, equal: self.password });

		// Operations
		self.register = function () {
			self.errors.removeAll();
			if (self.validationErrors().length > 0) {
				self.validationErrors.showAllMessages();
				return;
			}
			self.registering(true);

			auth.register({
				userName: self.userName(),
				email: self.email(),
				password: self.password(),
				confirmPassword: self.confirmPassword()
			}).done(function (data) {
				auth.login({
					grant_type: "password",
					username: self.userName(),
					email: self.email(),
					password: self.password()
				}).done(function (data) {
					self.registering(false);

					if (data.userName && data.access_token) {
						app.user.navigateToLoggedIn(data.userName, data.access_token, false /* persistent */);
					} else {
						self.errors.push("An unknown error occurred.");
					}
				}).fail(function (response) {
					var data = response.responseJSON;
					self.registering(false);

					//var errors = auth.toErrorsArray(data);
					//if (errors) {
					//	self.errors(errors);
					//}
					//else
					if (data && data.error_description) {
						self.errors.push(data.error_description);
					} else {
						self.errors.push("An unknown error occurred.");
					}
				});
			}).fail(function (response) {
				var data = response.responseJSON;
				console.warn("[registration] failed", data);
				self.registering(false);
				var errors = auth.toErrorsArray(data);
				if (errors) {
					self.errors(errors);
				}
				else {
					self.errors.push("An unknown error occurred.");
				}
			});
		};

	};
	return vm;

}); //define
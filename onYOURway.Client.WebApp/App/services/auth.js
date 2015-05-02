define([
  'durandal/system',
  'services/tell',
  'services/platform'
], function (system, tell, platform) {
	var self = this;

	// Routes
	var routes = {
		siteUrl: config.host + "/",
		addExternalLoginUrl: config.host + "/Account/AddExternalLogin",
		changePasswordUrl: config.host + "/Account/ChangePassword",
		loginUrl: config.host + "/Token",
		logoutUrl: config.host + "/Account/Logout",
		registerUrl: config.host + "/Account/Register",
		registerExternalUrl: config.host + "/Account/RegisterExternal",
		removeLoginUrl: config.host + "/Account/RemoveLogin",
		setPasswordUrl: config.host + "/Account/SetPassword",
		userInfoUrl: config.host + "/Account/UserInfo",
		externalLoginsUrl: function externalLoginsUrl(returnUrl, generateState) {
			return config.host + "/Account/ExternalLogins"
				+ "?returnUrl=" + (encodeURIComponent(returnUrl))
				+ "&generateState=" + (generateState ? "true" : "false");
		},
		manageInfoUrl: function manageInfoUrl(returnUrl, generateState) {
			return config.host + "/Account/ManageInfo"
				+ "?returnUrl=" + (encodeURIComponent(returnUrl))
				+ "&generateState=" + (generateState ? "true" : "false");
		}
	};

	// Other private operations
	function getSecurityHeaders() {
		var accessToken = sessionStorage["accessToken"] || localStorage["accessToken"];
		if (accessToken) {
			return { "Authorization": "Bearer " + accessToken };
		}
		return {};
	}

	var auth = {
		// Data
		returnUrl: routes.siteUrl, //window.location

		//make available for api unit tests
		routes: routes,

		// Operations
		securityHeaders: getSecurityHeaders,
		clearAccessToken: function () {
			localStorage.removeItem("accessToken");
			sessionStorage.removeItem("accessToken");
		},
		setAccessToken: function (accessToken, persistent) {
			if (persistent) {
				localStorage["accessToken"] = accessToken;
			} else {
				sessionStorage["accessToken"] = accessToken;
			}
		},
		toErrorsArray: function (data) {
			var errors = [];
			var items;

			if (!data || !data.message) {
				return null;
			}
			if (data.modelState) {
				for (var key in data.modelState) {
					items = data.modelState[key];
					if (items.length) {
						for (var i = 0; i < items.length; i++) {
							errors.push(items[i]);
						}
					}
				}
			}
			if (errors.length === 0) {
				errors.push(data.message);
			}
			return errors;
		},

		// Data access operations
		addExternalLogin: function (data) {
			return $.ajax(routes.addExternalLoginUrl, {
				type: "POST",
				data: data,
				headers: getSecurityHeaders()
			});
		},
		changePassword: function (data) {
			return $.ajax(routes.changePasswordUrl, {
				type: "POST",
				data: data,
				headers: getSecurityHeaders()
			});
		},
		getExternalLogins: function (returnUrl, generateState) {
			return $.ajax(routes.externalLoginsUrl(returnUrl, generateState), {
				cache: false,
				headers: getSecurityHeaders()
			});
		},
		getManageInfo: function (returnUrl, generateState) {
			return $.ajax(routes.manageInfoUrl(returnUrl, generateState), {
				cache: false,
				headers: getSecurityHeaders()
			});
		},
		getUserInfo: function (accessToken) {
			var headers;
			if (typeof (accessToken) !== "undefined") {
				headers = {
					"Authorization": "Bearer " + accessToken
				};
			} else {
				headers = getSecurityHeaders();
			}
			return $.ajax(routes.userInfoUrl, {
				cache: false,
				headers: headers
			});
		},
		login: function (data) {
			return $.ajax(routes.loginUrl, {
				type: "POST",
				data: data
			});
		},
		logout: function () {
			//TODO: clear user info
			return $.ajax(routes.logoutUrl, {
				type: "POST",
				headers: getSecurityHeaders()
			});
		},
		register: function (data) {
			return $.ajax(routes.registerUrl, {
				type: "POST",
				data: data
			});
		},
		registerExternal: function (accessToken, data) {
			return $.ajax(routes.registerExternalUrl, {
				type: "POST",
				data: data,
				headers: {
					"Authorization": "Bearer " + accessToken
				}
			});
		},
		removeLogin: function (data) {
			return $.ajax(routes.removeLoginUrl, {
				type: "POST",
				data: data,
				headers: getSecurityHeaders()
			});
		},
		setPassword: function (data) {
			return $.ajax(routes.setPasswordUrl, {
				type: "POST",
				data: data,
				headers: getSecurityHeaders()
			});
		}

	};
	return auth;

});//module
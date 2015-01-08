﻿using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.Owin;
using Microsoft.Owin.Security.Cookies;
using Microsoft.Owin.Security.OAuth;
using Owin;
using onYOURway.Providers;

namespace onYOURway {
	public partial class Auth {

		public static OAuthAuthorizationServerOptions OAuthOptions { get; private set; }
		public static Func<UserManager<IdentityUser>> UserManagerFactory { get; set; }
		public static string PublicClientId { get; private set; }

		public static void Startup() {


			PublicClientId = "self";

			IdentityDbContext db = new IdentityDbContext("onYOURway");
			UserManagerFactory = () => new UserManager<IdentityUser>(new UserStore<IdentityUser>(db));

			OAuthOptions = new OAuthAuthorizationServerOptions {
				TokenEndpointPath = new PathString("/Token"),
				Provider = new ApplicationOAuthProvider(PublicClientId, UserManagerFactory),
				AuthorizeEndpointPath = new PathString("/api/Account/ExternalLogin"),
				AccessTokenExpireTimeSpan = TimeSpan.FromDays(14),
				AllowInsecureHttp = true
			};
		} //Startup

		// For more information on configuring authentication, please visit http://go.microsoft.com/fwlink/?LinkId=301864
		public static void Configure(IAppBuilder app) {
			// Enable the application to use a cookie to store information for the signed in user
			// and to use a cookie to temporarily store information about a user logging in with a third party login provider
			app.UseCookieAuthentication(new CookieAuthenticationOptions());
			app.UseExternalSignInCookie(DefaultAuthenticationTypes.ExternalCookie);

			// Enable the application to use bearer tokens to authenticate users
			app.UseOAuthBearerTokens(OAuthOptions);

			// Uncomment the following lines to enable logging in with third party login providers
			//app.UseMicrosoftAccountAuthentication(
			//    clientId: "",
			//    clientSecret: "");

			//app.UseTwitterAuthentication(
			//    consumerKey: "",
			//    consumerSecret: "");

			//app.UseFacebookAuthentication(
			//    appId: "",
			//    appSecret: "");

			app.UseGoogleAuthentication();
		} //ConfigureAuth


	} //class Startup
} //ns
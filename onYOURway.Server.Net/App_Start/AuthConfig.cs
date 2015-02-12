using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.Owin;
using Microsoft.Owin.Security.Cookies;
using Microsoft.Owin.Security.OAuth;
using Owin;
using onYOURway.Providers;
using onYOURway.Models;

namespace onYOURway {
	public partial class Auth {

		public static OAuthAuthorizationServerOptions OAuthOptions { get; private set; }
		//public static Func<UserManager<UserLoginInfo, Int32>> UserManagerFactory { get; set; }
		public static string PublicClientId { get; private set; }

		//public static void Startup() {



		//	IdentityDbContext db = new onYOURwayDbContext();
		//	UserManagerFactory = () => new UserManager<User, Int32>(new UserStore<User, Role, Int32, UserExternalLogin, UserRole, UserClaim>(db));

		//	// Configure the application for OAuth based flow
		//	PublicClientId = "self";
		//	OAuthOptions = new OAuthAuthorizationServerOptions {
		//		TokenEndpointPath = new PathString("/Token"),
		//		Provider = new OAuthProvider(PublicClientId),
		//		AuthorizeEndpointPath = new PathString("/api/Account/ExternalLogin"),
		//		AccessTokenExpireTimeSpan = TimeSpan.FromDays(14),
		//		AllowInsecureHttp = true
		//	};
		//} //Startup

		// For more information on configuring authentication, please visit http://go.microsoft.com/fwlink/?LinkId=301864
		public static void Configure(IAppBuilder app) {

			app.CreatePerOwinContext<onYOURwayDbContext>(() => new onYOURwayDbContext());
			app.CreatePerOwinContext<AppUserManager>(AppUserManager.Create);
			app.CreatePerOwinContext<AppRoleManager>(AppRoleManager.Create);

			app.UseCookieAuthentication(new CookieAuthenticationOptions());
			app.UseExternalSignInCookie(DefaultAuthenticationTypes.ExternalCookie);

			// Configure the application for OAuth based flow
			PublicClientId = "self";
			OAuthOptions = new OAuthAuthorizationServerOptions {
				TokenEndpointPath = new PathString("/Token"),
				Provider = new OAuthProvider(PublicClientId),
				AuthorizeEndpointPath = new PathString("/api/Account/ExternalLogin"),
				AccessTokenExpireTimeSpan = TimeSpan.FromDays(14),
				AllowInsecureHttp = true
			};



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

			//app.UseGoogleAuthentication();

		} //ConfigureAuth


	} //class Auth
} //ns

using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin.Security;
using Microsoft.Owin.Security.Cookies;
using Microsoft.Owin.Security.OAuth;
using onYOURway.Models;
using Microsoft.AspNet.Identity.EntityFramework;
using System.Linq;

namespace onYOURway.Providers {

	public class OAuthProvider : OAuthAuthorizationServerProvider {

		private readonly string _publicClientId;

		public OAuthProvider(string publicClientId) {
			if (publicClientId == null) {
				throw new ArgumentNullException("publicClientId");
			}

			_publicClientId = publicClientId;
		}

		public override async Task GrantResourceOwnerCredentials(OAuthGrantResourceOwnerCredentialsContext context) {
			var userManager = context.OwinContext.GetUserManager<AppUserManager>();

			User user = await userManager.FindAsync(context.UserName, context.Password);
			if (user == null) {
				context.SetError("invalid_grant", "The user name or password is incorrect.");
				return;
			}

			ClaimsIdentity oAuthIdentity = await user.GenerateUserIdentityAsync(userManager, OAuthDefaults.AuthenticationType);
			ClaimsIdentity cookiesIdentity = await user.GenerateUserIdentityAsync(userManager, CookieAuthenticationDefaults.AuthenticationType);

			AuthenticationProperties properties = CreateProperties(user);
			AuthenticationTicket ticket = new AuthenticationTicket(oAuthIdentity, properties);
			context.Validated(ticket);
			context.Request.Context.Authentication.SignIn(cookiesIdentity);
		}

		public override Task TokenEndpoint(OAuthTokenEndpointContext context) {
			foreach (KeyValuePair<string, string> property in context.Properties.Dictionary) {
				context.AdditionalResponseParameters.Add(property.Key, property.Value);
			}

			return Task.FromResult<object>(null);
		}

		public override Task ValidateClientAuthentication(OAuthValidateClientAuthenticationContext context) {
			bool isValidated = false;
			// Resource owner password credentials does not provide a client ID.
			if (context.ClientId == null) {
				isValidated = context.Validated();
			}

			return Task.FromResult<object>(null);
		}

		public override Task ValidateClientRedirectUri(OAuthValidateClientRedirectUriContext context) {
			if (context.ClientId == _publicClientId) {
				Uri expectedRootUri = new Uri(context.Request.Uri, "/");

				if (expectedRootUri.AbsoluteUri == context.RedirectUri) {
					context.Validated();
				}
			}

			return Task.FromResult<object>(null);
		}

		public static AuthenticationProperties CreateProperties(User user) {
			IDictionary<string, string> data = new Dictionary<string, string> {
				{ "userName", user.UserName }
      };
			return new AuthenticationProperties(data);
		}

	} //class

} //ns
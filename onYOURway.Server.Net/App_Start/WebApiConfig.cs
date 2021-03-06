﻿using Breeze.Serialization;
using Microsoft.Owin.Security.OAuth;
using Newtonsoft.Json.Serialization;
using System.Configuration;
using System.Web.Http;
using System.Web.Http.Cors;

namespace onYOURway.StartUp {

	/// <summary>
	/// Class to register the custom WebApi configuration for Breeze
	/// </summary>
	public static class WebApiConfig {

		/// <summary>
		/// Configures the WebApi, enables CORS and Authentication Filters and registers routes. 
		/// </summary>
		/// <param name="config">HttpConfiguration to be set (passed by the system)</param>
		public static void Register(HttpConfiguration config) {

			// Web API configuration and services
			// Configure Web API to use only bearer token authentication.
			config.SuppressDefaultHostAuthentication();
			config.Filters.Add(new HostAuthenticationFilter(OAuthDefaults.AuthenticationType));

			//Enable CORS (see: http://msdn.microsoft.com/en-us/magazine/dn532203.aspx)
			config.EnableCors(new EnableCorsAttribute("*", "*", "GET, POST"));

			// Use camel case for JSON data.
			config.Formatters.JsonFormatter.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();

			// Web API routes
			//	use routes defined by code attributes
			config.MapHttpAttributeRoutes();
			//	configure global routing templates
			config.Routes.MapHttpRoute(
			  name: "onyourwayBreezeApi",
			  routeTemplate: "{controller}/{action}"
			);
			config.Routes.MapHttpRoute(
			  name: "onyourwayBreezeRealmApi",
			  routeTemplate: "{controller}/{realm}/{action}",
			  defaults: new { realm = string.Empty }
			);
		} //Register

	} //class WebApiConfig

	/// <summary>
	/// Custom Breeze Confguration
	/// </summary>
	public class CustomBreezeConfig : Breeze.ContextProvider.BreezeConfig {

		/// <summary>
		/// Customize the JsonSerializer used by the Breeze ApiController
		/// </summary>
		/// <returns>Customized Settngs</returns>
		/// <remarks>Beware of settings that confuse the breeze client</remarks>
		/// <see cref="http://www.breezejs.com/documentation/web-api-controller"/>
		protected override Newtonsoft.Json.JsonSerializerSettings CreateJsonSerializerSettings() {
			var serializerSettings = base.CreateJsonSerializerSettings();
			serializerSettings.Binder = DynamicTypeRenamingSerializationBinder.Instance;
			//serializerSettings.NullValueHandling = Newtonsoft.Json.NullValueHandling.Ignore; 
			//serializerSettings.MissingMemberHandling = Newtonsoft.Json.MissingMemberHandling.Ignore;
			return serializerSettings;
		}

	} //class CustomBreezeConfig

} //ns

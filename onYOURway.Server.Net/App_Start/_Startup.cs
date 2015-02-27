using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Owin;
using Owin;
using System.Web.Http;
//using System.Web.Mvc;

[assembly: OwinStartup(typeof(onYOURway.StartUp.Startup))]
namespace onYOURway.StartUp {
	public partial class Startup {
		
		public Startup() {
		}

		public void Configuration(IAppBuilder app) {

			//TODO: setup global error handler
			//GlobalFilters.Filters.Add(new HandleErrorAttribute());

			//Database
			DatabaseConfig.Configure();
			//OWIN Middleware
			IdentityConfig.Configure(app);
			//WebApi
			GlobalConfiguration.Configure(WebApiConfig.Register);

		}

	} //class
} //ns

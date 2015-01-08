using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Owin;
using Owin;
using System.Web.Http;
using System.Web.Mvc;

[assembly: OwinStartup(typeof(onYOURway.Startup))]

namespace onYOURway {
	public partial class Startup {
		
		public Startup() {
			Auth.Startup();
		}

		public void Configuration(IAppBuilder app) {

			GlobalFilters.Filters.Add(new HandleErrorAttribute());

			Auth.Configure(app);
			GlobalConfiguration.Configure(WebApiConfig.Register);

		}

	} //class
} //ns

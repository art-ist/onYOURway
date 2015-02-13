using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using onYOURway.Models;
using System.Data.Entity;
using System.Diagnostics;

namespace onYOURway.StartUp {
	public class DatabaseConfig {

		public static void Configure() {
			var createDb = ConfigurationManager.AppSettings["CreateDatabase"];
			if (createDb == "IfNotExists") {
				//set initializer
				Database.SetInitializer<onYOURwayDbContext>(new onYOURwayDbInitializer());
				//trigger init
				using (var db = new onYOURwayDbContext()) {
					var r = db.Realms.Count();
					Trace.WriteLine(string.Format("Database initialized with {0} realms.", r), "Database");
				}
			}
		}

	}
}
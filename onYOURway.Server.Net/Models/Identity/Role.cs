using System;
using System.ComponentModel.DataAnnotations.Schema;
using System.Threading.Tasks;
using System.Security.Claims;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using System.Data.Entity;
using System.Linq;
using System.Collections.Generic;

namespace onYOURway.Models {
	// You can add profile data for the user by adding more properties to your ApplicationUser class, please visit http://go.microsoft.com/fwlink/?LinkID=317594 to learn more.

	// Must be expressed in terms of our custom UserRole:
	public partial class Role /* : IdentityRole<string, ApplicationUserRole> */ {
		public Role() {
			//TODO: this.Id;
		}

		public Role(string name)
			: this() {
			this.Name = name;
		}

		// Add any custom Role properties/code here
	}

} //ns
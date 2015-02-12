﻿using System;
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

	public partial class User /* : IdentityUser , IInterceptable*/ {
		public User()
			: base() {
		}

		public async Task<ClaimsIdentity> GenerateUserIdentityAsync(AppUserManager manager, string authenticationType) {

			// Note the authenticationType must match the one defined in CookieAuthenticationOptions.AuthenticationType
			var userIdentity = await manager.CreateIdentityAsync(this, authenticationType);
			// Add custom user claims here
			return userIdentity;

		}


	} //class User

} //ns
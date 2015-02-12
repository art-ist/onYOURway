using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin;

namespace onYOURway.Models {

	public class onYOURwayDbInitializer : CreateDatabaseIfNotExists<onYOURwayDbContext> {

		protected override void Seed(onYOURwayDbContext context) {
			//SeedAdminAccountAndRole(context);
			base.Seed(context);
		}

		////Create User=Admin@Admin.com with password=Admin@123456 in the Admin role        
		//public static void SeedAdminAccountAndRole(onYOURwayDbContext db) {
		//	var userManager = HttpContext
		//		.Current
		//		.GetOwinContext()
		//		.GetUserManager<AppUserManager>();

		//	var roleManager = HttpContext
		//		.Current
		//		.GetOwinContext()
		//		.Get<AppRoleManager>();

		//	const string name = "Admin";
		//	const string password = "Admin@123456";
		//	const string roleName = "Admin";

		//	//Create Role Admin if it does not exist
		//	var role = roleManager.FindByNameAsync(roleName);
		//	if (role == null) {
		//		role = new Role(roleName);
		//		var roleresult = roleManager.Create(role);
		//	}

		//	var user = userManager.FindByName(name);
		//	if (user == null) {
		//		user = new User { UserName = name, Email = name };
		//		var result = userManager.Create(user, password);
		//		result = userManager.SetLockoutEnabled(user.Id, false);
		//	}

		//	// Add user admin to Role Admin if not already added
		//	var rolesForUser = userManager.GetRoles(user.Id);
		//	if (!rolesForUser.Contains(role.Name)) {
		//		var result = userManager.AddToRole(user.Id, role.Name);
		//	}
		//} //SeedAdminAccountAndRole

	} //class onYOURwayDbInitializer

} //ns
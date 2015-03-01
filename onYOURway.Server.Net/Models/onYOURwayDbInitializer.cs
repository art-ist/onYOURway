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

		protected override void Seed(onYOURwayDbContext db) {
			base.Seed(db);

			//Create additional db logic (Constraints and Indexes that can't be defined in EF, Functions, Procedures )
			db.RunSqlScript(HttpContext.Current.Server.MapPath("Models/onYOURwayDbAfterModelCreated.sql"));

			//Initialize Security
			SeedAdminAccountAndRole(db);

		}

		//Create User=Admin with password=Pa$$w0rd in the Admin role        
		public static void SeedAdminAccountAndRole(onYOURwayDbContext db) {

			using (AppUserManager userManager = new AppUserManager(new AppUserStore(db))) {
				using (AppRoleManager roleManager = new AppRoleManager(new AppRoleStore(db))) {
					const string name = "Admin";
					const string email = "admin@nomail.local";
					const string password = "Pa$$w0rd";
					const string roleName = "Admin";

					//Create Role Admin if it does not exist
					var role = roleManager.FindByName(roleName);
					if (role == null) {
						role = new Role(roleName);
						var roleResult = roleManager.Create(role);
					}

					var user = userManager.FindByName(name);
					if (user == null) {
						user = new User { 
							UserName = name,
 							Email = email
						};
						var result = userManager.Create(user, password);
						result = userManager.SetLockoutEnabled(user.Id, false);
					}

					// Add user admin to Role Admin if not already added
					var rolesForUser = userManager.GetRoles(user.Id);
					if (!rolesForUser.Contains(role.Name)) {
						var result = userManager.AddToRole(user.Id, role.Name);
					}
					//DON'T FORGET THIS!!!
					db.SaveChanges();
				} //using roleManager
			} //using userManager

		} //SeedAdminAccountAndRole

	} //class onYOURwayDbInitializer

} //ns
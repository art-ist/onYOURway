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

	[Table("Users", Schema="App")]
	public partial class User : IdentityUser /*, IInterceptable*/ {
		public User()
			: base() {
			//this.Roles = new HashSet<IdentityUserRole>();
		}


		/*
		/// <summary>
		/// Email
		/// </summary>
		public virtual string Email { get; set; }
		public virtual string NormalizedEmail { get; set; }
		/// <summary>
		/// True if the email is confirmed, default is false
		/// </summary>
		public virtual bool EmailConfirmed { get; set; }
		/// <summary>
		/// The salted/hashed form of the user password
		/// </summary>
		public virtual string PasswordHash { get; set; }
		/// <summary>
		/// A random value that should change whenever a users credentials change (password changed, login removed)
		/// </summary>
		public virtual string SecurityStamp { get; set; }
		/// <summary>
		/// A random value that should change whenever a user is persisted to the store
		/// </summary>
		public virtual string ConcurrencyStamp { get; set; }
		/// <summary>
		/// PhoneNumber for the user
		/// </summary>
		public virtual string PhoneNumber { get; set; }
		/// <summary>
		/// True if the phone number is confirmed, default is false
		/// </summary>
		public virtual bool PhoneNumberConfirmed { get; set; }
		/// <summary>
		/// Is two factor enabled for the user
		/// </summary>
		public virtual bool TwoFactorEnabled { get; set; }
		/// <summary>
		/// DateTime in UTC when lockout ends, any time in the past is considered not locked out.
		/// </summary>
		public virtual DateTimeOffset? LockoutEnd { get; set; }
		/// <summary>
		/// Is lockout enabled for this user
		/// </summary>
		public virtual bool LockoutEnabled { get; set; }
		/// <summary>
		/// Used to record failures for the purposes of lockout
		/// </summary>
		public virtual int AccessFailedCount { get; set; }
		 
		*/


		public async Task<ClaimsIdentity> GenerateUserIdentityAsync(UserManager<User> manager, string authenticationType) {

			// Note the authenticationType must match the one defined in CookieAuthenticationOptions.AuthenticationType
			var userIdentity = await manager.CreateIdentityAsync(this, authenticationType);
			// Add custom user claims here
			return userIdentity;

		}

	} //User



} //ns
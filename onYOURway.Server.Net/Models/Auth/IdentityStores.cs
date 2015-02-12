using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;

namespace onYOURway.Models {

	// Most likely won't need to customize these either, but they were needed because we implemented
	// custom versions of all the other types:
	public class AppUserStore : UserStore<User, Role, Int32, UserExternalLogin, UserRole , UserClaim>
									  , IUserStore<User, Int32>
									  , IDisposable {
		public AppUserStore() 
			: this(new onYOURwayDbContext()) {
			base.DisposeContext = true;
		}

		public AppUserStore(DbContext context)
			: base(context) {
		}

	} //class AppUserStore


	public class AppRoleStore : RoleStore<Role, Int32, UserRole>
									  ,	IQueryableRoleStore<Role, Int32>
									  ,	IRoleStore<Role, Int32>
									  , IDisposable {
		public AppRoleStore()
			: base(new IdentityDbContext()) {
			base.DisposeContext = true;
		}

		public AppRoleStore(DbContext context)
			: base(context) {
		}

	} //class AppRoleStore

} //ns
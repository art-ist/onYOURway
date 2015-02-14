using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin;
using Microsoft.Owin.Security;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;

namespace onYOURway.Models {

	public class AppUserManager : UserManager<User, Int32> {
		public AppUserManager(IUserStore<User, Int32> store)
			: base(store) {
		}

		public static AppUserManager Create(IdentityFactoryOptions<AppUserManager> options, IOwinContext context) {
			var manager = new AppUserManager(new AppUserStore(context.Get<onYOURwayDbContext>()));

			// Configure validation logic for usernames
			manager.UserValidator = new UserValidator<User, Int32>(manager) {
				AllowOnlyAlphanumericUserNames = false,
				RequireUniqueEmail = true
			};

			// Configure validation logic for passwords
			manager.PasswordValidator = new PasswordValidator {
				RequiredLength = 6,
				RequireNonLetterOrDigit = true,
				RequireDigit = true,
				RequireLowercase = true,
				RequireUppercase = true,
			};

			var dataProtectionProvider = options.DataProtectionProvider;
			if (dataProtectionProvider != null) {
				manager.UserTokenProvider = new DataProtectorTokenProvider<User, Int32>(
					dataProtectionProvider.Create("ASP.NET Identity")
				);
			}
			return manager;
		} //Create

	} //class AppUserManager

	public class AppRoleManager : RoleManager<Role, Int32> {
		public AppRoleManager(IRoleStore<Role, Int32> roleStore)
			: base(roleStore) {
		}

		public static AppRoleManager Create( IdentityFactoryOptions<AppRoleManager> options, IOwinContext context) {
			return new AppRoleManager( new AppRoleStore(context.Get<onYOURwayDbContext>()));
		} //Create
		
	} //class AppRoleManager

	public class AppSignInManager : SignInManager<User, Int32> {
		public AppSignInManager(AppUserManager userManager, IAuthenticationManager authenticationManager) :
			base(userManager, authenticationManager) { }

		public Task<ClaimsIdentity> CreateUserIdentityAsync(User user, string authenticationType) {
			return user.GenerateUserIdentityAsync((AppUserManager)UserManager, authenticationType);
		}

		public static AppSignInManager Create(IdentityFactoryOptions<AppSignInManager> options, IOwinContext context) {
			return new AppSignInManager(context.GetUserManager<AppUserManager>(), context.Authentication);
		}

	} //class AppSignInManager

} //ns
using System.Threading.Tasks;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin;

namespace onYOURway.Models {
	// Configure the user manager used in this application. UserManager is defined in ASP.NET Identity and is used by the application.
	public class AppUserManager : UserManager<User> {
		public AppUserManager(IUserStore<User> store)
			: base(store) {
		}

	} //class

} //ns

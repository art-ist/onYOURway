using System;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNet.Identity.EntityFramework;

namespace onYOURway.Models {
	//See		http://www.codeproject.com/Articles/762428/ASP-NET-MVC-and-Identity-Understanding-the-Basics
	//Source	https://aspnetidentity.codeplex.com/ 

	[Table("UserRoles", Schema = "App")]
	public partial class UserRole : IdentityUserRole<Int32> { }

	[Table("Roles", Schema = "App")]
	public partial class Role : IdentityRole<Int32, UserRole> { }

	[Table("UserClaims", Schema = "App")]
	public partial class UserClaim : IdentityUserClaim<Int32> { }

	[Table("UserExternalLogins", Schema = "App")]
	public partial class UserExternalLogin : IdentityUserLogin<Int32> { }

	[Table("Users", Schema = "App")]
	public partial class User : IdentityUser<Int32, UserExternalLogin, UserRole, UserClaim> { }

} //ns
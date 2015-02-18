using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Http;

namespace onYOURway.Controllers {

	#region BindingModels
	// Models used as parameters to AccountController actions.

	public class AddExternalLoginBindingModel {
		[Required]
		[Display(Name = "External access token")]
		public string ExternalAccessToken { get; set; }
	}
	public class ChangePasswordBindingModel {
		[Required]
		[DataType(DataType.Password)]
		[Display(Name = "Current password")]
		public string OldPassword { get; set; }
		[Required]
		[StringLength(100, ErrorMessage = "The {0} must be at least {2} characters long.", MinimumLength = 6)]
		[DataType(DataType.Password)]
		[Display(Name = "New password")]
		public string NewPassword { get; set; }
		[DataType(DataType.Password)]
		[Display(Name = "Confirm new password")]
		[Compare("NewPassword", ErrorMessage = "The new password and confirmation password do not match.")]
		public string ConfirmPassword { get; set; }
	}
	public class RegisterBindingModel {
		[Required]
		[Display(Name = "UserName")]
		public string UserName { get; set; }
		[Required]
		[Display(Name = "Email")]
		public string Email { get; set; }
		[Required]
		[StringLength(100, ErrorMessage = "The {0} must be at least {2} characters long.", MinimumLength = 6)]
		[DataType(DataType.Password)]
		[Display(Name = "Password")]
		public string Password { get; set; }
		[DataType(DataType.Password)]
		[Display(Name = "Confirm password")]
		[Compare("Password", ErrorMessage = "The password and confirmation password do not match.")]
		public string ConfirmPassword { get; set; }
	}
	public class RegisterExternalBindingModel {
		[Required]
		[Display(Name = "Email")]
		public string Email { get; set; }
	}
	public class RemoveLoginBindingModel {
		[Required]
		[Display(Name = "Login provider")]
		public string LoginProvider { get; set; }
		[Required]
		[Display(Name = "Provider key")]
		public string ProviderKey { get; set; }
	}
	public class SetPasswordBindingModel {
		[Required]
		[StringLength(100, ErrorMessage = "The {0} must be at least {2} characters long.", MinimumLength = 6)]
		[DataType(DataType.Password)]
		[Display(Name = "New password")]
		public string NewPassword { get; set; }
		[DataType(DataType.Password)]
		[Display(Name = "Confirm new password")]
		[Compare("NewPassword", ErrorMessage = "The new password and confirmation password do not match.")]
		public string ConfirmPassword { get; set; }
	}

	#endregion BindingModels

	#region ViewModels
	// Models returned by AccountController actions.

	public class ExternalLoginViewModel {
		public string Name { get; set; }

		public string Url { get; set; }

		public string State { get; set; }
	}

	public class ManageInfoViewModel {
		public string LocalLoginProvider { get; set; }

		public string Email { get; set; }

		public IEnumerable<UserLoginInfoViewModel> Logins { get; set; }

		public IEnumerable<ExternalLoginViewModel> ExternalLoginProviders { get; set; }
	}

	//public class UserInfoViewModel {
	//	public string UserName { get; set; }
	//	public string Email { get; set; }
	//	public bool HasRegistered { get; set; }
	//	public string LoginProvider { get; set; }
	//	//public string Address { get; set; }
	//	//public string City { get; set; }
	//	//public string State { get; set; }
	//	//public string PostalCode { get; set; }
	//}

	public class UserLoginInfoViewModel {
		public string LoginProvider { get; set; }

		public string ProviderKey { get; set; }
	}

	#endregion ViewModels

	#region Results

	public class ChallengeResult : IHttpActionResult {
		public ChallengeResult(string loginProvider, ApiController controller) {
			LoginProvider = loginProvider;
			Request = controller.Request;
		}
		public string LoginProvider { get; set; }
		public HttpRequestMessage Request { get; set; }
		public Task<HttpResponseMessage> ExecuteAsync(CancellationToken cancellationToken) {
			Request.GetOwinContext().Authentication.Challenge(LoginProvider);
			HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.Unauthorized);
			response.RequestMessage = Request;
			return Task.FromResult(response);
		}
	}

	#endregion Results

} //ns
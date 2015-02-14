using System;
using System.ComponentModel.DataAnnotations.Schema;
using System.Threading.Tasks;
using System.Security.Claims;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using System.Data.Entity;
using System.Linq;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace onYOURway.Models {

	public partial class UserExternalLogin /*: IdentityUserLogin<Int32> */ {

		[Key, Column(Order = 0), MaxLength(100)]
		public override string LoginProvider {
			get {
				return base.LoginProvider;
			}
			set {
				base.LoginProvider = value;
			}
		}

		[Key, Column(Order = 1), MaxLength(100)]
		public override string ProviderKey {
			get {
				return base.ProviderKey;
			}
			set {
				base.ProviderKey = value;
			}
		}

		public override int UserId {
			get {
				return base.UserId;
			}
			set {
				base.UserId = value;
			}
		}

	}

} //ns
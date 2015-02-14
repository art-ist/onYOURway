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

	public partial class UserRole {
		public UserRole()
			: base() {
		}

		[Key, Column(Order = 0)]
		public override int UserId {
			get {
				return base.UserId;
			}
			set {
				base.UserId = value;
			}
		}

		[Key, Column(Order = 1)]
		public override int RoleId {
			get {
				return base.RoleId;
			}
			set {
				base.RoleId = value;
			}
		}

	} //class User

} //ns
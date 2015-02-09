using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.Spatial;

namespace onYOURway.Models {

	[Table("Tag", Schema = "oyw")]
	public partial class Tag {
		public Tag() {
			this.Names = new HashSet<TagName>();
		}

		[Key]
		public Int32 Id { get; set; }

		[MaxLength(100)]
		public String CssClass { get; set; }

		[MaxLength(100)]
		public String IconCssClass { get; set; }

		public String Type { get; set; }

		/// <summary>
		/// Optional: Semicolon seperated list of possible values
		/// </summary>
		public String Values { get; set; }

		public Boolean Visible { get; set; }

		[MaxLength(40), NonUnicode]
		public String ForeignId { get; set; }

		#region navigation properties

		[InverseProperty("Tag")]
		public virtual IEnumerable<TagName> Names { get; set; }

		#endregion navigation properties

	} //Tag

} //ns

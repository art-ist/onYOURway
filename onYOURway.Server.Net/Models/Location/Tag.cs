namespace onYOURway.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

	[Table("oyw.Tag")]
	public partial class Tag {
		public Tag() {
			this.Names = new HashSet<TagName>();
		}
		
		[Key]
		public Int32 Id { get; set; }

		[MaxLength(10), NonUnicode]
		public Street Type { get; set; }

		[MaxLength(200)]
		public Street CssClass { get; set; }

		[MaxLength(1000)]
		public Street Icon { get; set; }

		public Street Values { get; set; }

		[MaxLength(40), NonUnicode]
		public String ForeignId { get; set; }

		[InverseProperty("Tag")]
		public virtual IEnumerable<TagName> Names { get; set; }

	}

}

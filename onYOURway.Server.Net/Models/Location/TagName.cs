using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.Spatial;

namespace onYOURway.Models {

	[Table("oyw.TagName")]
	public partial class TagName {

		[Key, Column(Order = 0)]
		public Int32 TagId { get; set; }

		[Key, Column(Order = 1), MaxLength(2), MinLength(2), NonUnicode]
		public String Lang { get; set; }

		[MaxLength(1000)]
		public String Name { get; set; }

		public Boolean Show { get; set; }

		public String Description { get; set; }

		[ForeignKey("TagId")]
		public virtual Tag Tag { get; set; }

	}

}

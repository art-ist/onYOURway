using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.Spatial;

namespace onYOURway.Models {

	[Table("CategoryNames", Schema = "oyw")]
	public partial class CategoryName {

		[Key, Column(Order = 0)]
		public Int32 CategoryId { get; set; }

		[Key, Column(Order = 1), MaxLength(2), MinLength(2), NonUnicode]
		public String Lang { get; set; }

		[MaxLength(1000)]
		public String Name { get; set; }

		public Boolean Show { get; set; }

		public String Description { get; set; }

		[ForeignKey("CategoryId")]
		public virtual Category Category { get; set; }

	}

}

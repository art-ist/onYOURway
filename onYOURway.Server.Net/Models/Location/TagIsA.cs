using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.Spatial;

namespace onYOURway.Models {

	[Table("oyw.TagIsA")]
	public partial class TagIsA {
		public int? TagId { get; set; }

		public int? ParentId { get; set; }

		[Key]
		[DatabaseGenerated(DatabaseGeneratedOption.None)]
		public int Position { get; set; }
	}
}

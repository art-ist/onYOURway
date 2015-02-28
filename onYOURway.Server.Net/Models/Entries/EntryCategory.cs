using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.Spatial;

namespace onYOURway.Models {

	[Table("EntryCategories", Schema = "oyw")]
	public partial class EntryCategory {
		[Key, Column(Order = 0), DatabaseGenerated(DatabaseGeneratedOption.None)]
		public Guid EntryId { get; set; }

		[Key, Column(Order = 1), DatabaseGenerated(DatabaseGeneratedOption.None)]
		public Guid CategoryId { get; set; }

		public String Value { get; set; }

		public String Comment { get; set; }

		#region navigation properties

		[ForeignKey("EntryId")]
		public virtual Entry Entry { get; set; }

		[ForeignKey("CategoryId")]
		public virtual Category Category { get; set; }

		#endregion navigation properties

	} //EntryTag
} //ns

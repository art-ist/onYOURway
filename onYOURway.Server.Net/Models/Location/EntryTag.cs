using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.Spatial;

namespace onYOURway.Models {

	[Table("EntryTags", Schema = "oyw")]
	public partial class EntryTag {
		[Key, Column(Order = 0), DatabaseGenerated(DatabaseGeneratedOption.None)]
		public Int64 EntryId { get; set; }

		[Key, Column(Order = 1), DatabaseGenerated(DatabaseGeneratedOption.None)]
		public Int32 TagId { get; set; }

		public String Value { get; set; }

		#region navigation properties

		[ForeignKey("EntryId")]
		public virtual Entry Entry { get; set; }

		[ForeignKey("TagId")]
		public virtual Tag Tag { get; set; }

		#endregion navigation properties

	} //EntryTag
} //ns

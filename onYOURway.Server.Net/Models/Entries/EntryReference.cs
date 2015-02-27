using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.Spatial;

namespace onYOURway.Models {
	[Table("EntryExternalIds", Schema = "oyw")]
	public partial class EntryExternalId {

		[Key, Column(Order = 0), DatabaseGenerated(DatabaseGeneratedOption.None)]
		public Guid EntryId { get; set; }

		[Key, Column(Order = 1), MaxLength(20), Index("IX_ExternalId", 0, IsUnique = true)]
		public String SystemKey { get; set; }

		[MaxLength(200), Index("IX_ExternalId", 1, IsUnique = true)]
		public String ExternalId { get; set; }

		#region navigation properties

		[ForeignKey("EntryId")]
		public virtual Entry Entry { get; set; }

		[ForeignKey("SystemKey")]
		public virtual ExternalSystem System { get; set; }

		#endregion navigation properties

	} //ExternalId
} //ns

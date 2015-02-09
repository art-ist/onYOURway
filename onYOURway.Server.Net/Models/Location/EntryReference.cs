namespace onYOURway.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

	[Table("EntryExternalIds", Schema = "oyw")]
    public partial class EntryExternalId
    {

		[Key, Column(Order = 0), DatabaseGenerated(DatabaseGeneratedOption.None)]
        public Int64 EntryId { get; set; }

		[Key, Column(Order = 1), MaxLength(20), Index("IX_ExternslId", 1, IsUnique = true)]
        public String ExternalSystemId { get; set; }

		[MaxLength(200), Index("IX_ExternslId", 0, IsUnique=true)]
		public String ExternalId { get; set; }

		#region navigation properties

		[ForeignKey("EntryId")]
        public virtual Entry Entry { get; set; }

		[ForeignKey("ExternalSystemId")]
		public virtual ExternalSystem ExternalSystem { get; set; }

		#endregion navigation properties

    } //ExternalId
} //ns

namespace onYOURway.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

	[Table("EntryReferences", Schema = "oyw")]
    public partial class EntryReference
    {
        [Key, Column(Order = 0), DatabaseGenerated(DatabaseGeneratedOption.None)]
        public Int64 Id { get; set; }

        [Key, Column(Order = 1), MaxLength(20)]
        public String ForeignSource { get; set; }

        [MaxLength(200)]
        public String ForeignId { get; set; }

		#region navigation properties

		[ForeignKey("Id")]
        public virtual Entry Entry { get; set; }

		[ForeignKey("PartnerId")]
        public virtual ExternalSystem Partner { get; set; }

		#endregion navigation properties

    } //ExternalId
} //ns

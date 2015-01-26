namespace onYOURway.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

	[Table("oyw.ExternalIDs")]
    public partial class ExternalId
    {
        [Key]
        [Column(Order = 0)]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public long Id { get; set; }

        [Key]
        [Column(Order = 1)]
        [StringLength(20)]
        public string PartnerId { get; set; }

        [StringLength(100)]
        public string ForeignId { get; set; }

		[ForeignKey("Id")]
        public virtual Entry Entry { get; set; }

		[ForeignKey("PartnerId")]
        public virtual Partner Partner { get; set; }
    }
}

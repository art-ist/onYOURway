namespace onYOURway.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("oyw.RegionView")]
    public partial class RegionView
    {
        [Key]
        [Column(Order = 0)]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public long RegionId { get; set; }

        [Key]
        [Column(Order = 1)]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int ViewId { get; set; }

        [Required]
        [StringLength(200)]
        public string Name { get; set; }

        public int ListOrder { get; set; }

        public DbGeography Boundary { get; set; }

        public virtual Region Region { get; set; }
    }
}

namespace onYOURway.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("oyw.RegionAlias")]
    public partial class RegionAlias
    {
        [Key]
        [Column(Order = 0)]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public long RegionId { get; set; }

        [Key]
        [Column(Order = 1)]
        [StringLength(2)]
        public string Lang { get; set; }

        [Key]
        [Column(Order = 2)]
        [StringLength(200)]
        public string Name { get; set; }

        [StringLength(1000)]
        public string Website { get; set; }

        public virtual Region Region { get; set; }
    }
}

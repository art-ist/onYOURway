namespace onYOURway.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("oyw.Region")]
    public partial class Region {
        public Region()
        {
            Aliases = new HashSet<RegionAlias>();
            Views = new HashSet<RegionView>();
        }

        public long Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Name { get; set; }

        [StringLength(1000)]
        public string Website { get; set; }

        public long? OsmRelationId { get; set; }

        public int CreatedBy { get; set; }

        [Column(TypeName = "datetime2")]
        public DateTime CreatedAt { get; set; }

        public int? ModifiedBy { get; set; }

        [Column(TypeName = "datetime2")]
        public DateTime? ModifiedAt { get; set; }

        public DbGeography Boundary { get; set; }

        public virtual ICollection<RegionAlias> Aliases { get; set; }

        public virtual ICollection<RegionView> Views { get; set; }
    }
}

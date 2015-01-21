namespace onYOURway.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("oyw.LocationAlias")]
    public partial class LocationAlias
    {
        public long LocationId { get; set; }

        [Required]
        [StringLength(2)]
        public string Lang { get; set; }

        [Required]
        [StringLength(200)]
        public string Name { get; set; }

        public long Id { get; set; }

        public virtual Location Location { get; set; }
    }
}

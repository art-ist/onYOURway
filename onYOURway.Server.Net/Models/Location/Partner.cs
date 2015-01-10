namespace onYOURway.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("oyw.Partner")]
    public partial class Partner
    {
        public Partner()
        {
            LocationForeignIds = new HashSet<LocationForeignId>();
        }

        [StringLength(20)]
        public string Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Name { get; set; }

        [StringLength(1000)]
        public string Website { get; set; }

        public virtual ICollection<LocationForeignId> LocationForeignIds { get; set; }
    }
}

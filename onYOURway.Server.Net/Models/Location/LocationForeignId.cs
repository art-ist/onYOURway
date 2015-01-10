namespace onYOURway.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("oyw.LocationForeignId")]
    public partial class LocationForeignId
    {
        [Key]
        [Column(Order = 0)]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public long LocationId { get; set; }

        [Key]
        [Column(Order = 1)]
        [StringLength(20)]
        public string PartnerId { get; set; }

        [StringLength(100)]
        public string ForeignId { get; set; }

        public virtual Location Location { get; set; }

        public virtual Partner Partner { get; set; }
    }
}

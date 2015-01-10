namespace onYOURway.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("oyw.LocationLink")]
    public partial class LocationLink
    {
        [Key]
        [Column(Order = 0)]
        public long Id { get; set; }

        [Key]
        [Column(Order = 1)]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public long LocationId { get; set; }

        [StringLength(2)]
        public string Lang { get; set; }

        [Required]
        [StringLength(30)]
        public string Tag { get; set; }

        [Required]
        [StringLength(1000)]
        public string URL { get; set; }

        public virtual Location Location { get; set; }
    }
}

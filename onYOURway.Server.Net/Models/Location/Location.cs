namespace onYOURway.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("oyw.Location")]
    public partial class Location
    {
        public Location()
        {
            HasTags = new HashSet<HasTag>();
            LocationForeignIds = new HashSet<LocationForeignId>();
            LocationAlias = new HashSet<LocationAlia>();
            LocationLinks = new HashSet<LocationLink>();
            ProductSuggestions = new HashSet<ProductSuggestion>();
        }

        public long Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Name { get; set; }

        [Required]
        [StringLength(2)]
        public string Lang { get; set; }

        [StringLength(2)]
        public string Country { get; set; }

        [StringLength(3)]
        public string Province { get; set; }

        [StringLength(50)]
        public string City { get; set; }

        [StringLength(10)]
        public string Zip { get; set; }

        [StringLength(200)]
        public string Street { get; set; }

        [StringLength(20)]
        public string HouseNumber { get; set; }

        [StringLength(100)]
        public string Phone { get; set; }

        public int CreatedBy { get; set; }

        [Column(TypeName = "datetime2")]
        public DateTime CreatedAt { get; set; }

        public int? ModifiedBy { get; set; }

        [Column(TypeName = "datetime2")]
        public DateTime? ModifiedAt { get; set; }

        public DbGeography Position { get; set; }

        [StringLength(50)]
        public string Icon { get; set; }

        [StringLength(1000)]
        public string OpeningHours { get; set; }

        public string Description { get; set; }

        [Required]
        [StringLength(10)]
        public string Type { get; set; }

        public virtual ICollection<HasTag> HasTags { get; set; }

        public virtual ICollection<LocationForeignId> LocationForeignIds { get; set; }

        public virtual ICollection<LocationAlia> LocationAlias { get; set; }

        public virtual ICollection<LocationLink> LocationLinks { get; set; }

        public virtual ICollection<ProductSuggestion> ProductSuggestions { get; set; }
    }
}

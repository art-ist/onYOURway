namespace onYOURway.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("oyw.Entries")]
    public partial class Entry
    {
        public Entry()
        {
            Tags = new HashSet<HasTag>();
            ForeignIds = new HashSet<ExternalId>();
            Aliases = new HashSet<LocationAlias>();
            Links = new HashSet<LocationLink>();
            //ProductSuggestions = new HashSet<ProductSuggestion>();
        }

        public long Id { get; set; }

        [Required, StringLength(200)]
        public string Name { get; set; }

        [Required]
        [StringLength(2), NonUnicode]
        public string Lang { get; set; }


        public int CreatedBy { get; set; }

        [Column(TypeName = "datetime2")]
        public DateTime CreatedAt { get; set; }

        public int? ModifiedBy { get; set; }

        [Column(TypeName = "datetime2")]
        public DateTime? ModifiedAt { get; set; }

        public DbGeography Position { get; set; }

        [StringLength(50)]
        public string Icon { get; set; }

        [StringLength(1000), NonUnicode]
        public string OpeningHours { get; set; }

        public string Description { get; set; }

        [Required, StringLength(10), NonUnicode]
        public string Type { get; set; }

        public virtual ICollection<HasTag> Tags { get; set; }

        public virtual ICollection<ExternalId> ForeignIds { get; set; }

        public virtual ICollection<LocationAlias> Aliases { get; set; }
		 
        public virtual ICollection<LocationLink> Links { get; set; }

    }
}

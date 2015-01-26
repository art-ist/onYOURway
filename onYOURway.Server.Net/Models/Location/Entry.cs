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
			Localizations = new HashSet<EntryLocalization>();
            Tags = new HashSet<EntryTag>();
            Links = new HashSet<EntryLink>();
            ForeignIds = new HashSet<EntryReference>();
        }

        public Int64 Id { get; set; }

        [Required, StringLength(200)]
        public String Name { get; set; }

        [Required]
        [NonUnicode, MinLength(2), MaxLength(5)]
        public String Locale { get; set; }


        public DbGeography Position { get; set; }


        [MaxLength(100)]
        public String IconClass { get; set; }

        [StringLength(1000), NonUnicode]
        public String OpeningHours { get; set; }

        public String Description { get; set; }

        [Required, StringLength(10), NonUnicode]
        public String Type { get; set; }


		public Int64 CreatedBy { get; set; }

		[Column(TypeName = "datetime2")]
		public DateTime CreatedAt { get; set; }

		public Int64? ModifiedBy { get; set; }

		[Column(TypeName = "datetime2")]
		public DateTime? ModifiedAt { get; set; }


		#region navigation properties

		public virtual ICollection<EntryTag> Tags { get; set; }

        public virtual ICollection<EntryReference> ForeignIds { get; set; }

		public virtual ICollection<EntryLocalization> Localizations { get; set; }
		 
        public virtual ICollection<EntryLink> Links { get; set; }

		#endregion navigation properties

	} //Entry
} //ns

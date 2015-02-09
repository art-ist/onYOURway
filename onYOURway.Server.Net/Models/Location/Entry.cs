namespace onYOURway.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

	/// <summary>
	/// An Entry is an item of interest. Currently this can be a Location or an Event.
	/// </summary>
	[Table("Entries", Schema = "oyw")]
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


        [Required]
        [NonUnicode, MinLength(2), MaxLength(5)]
        public String Locale { get; set; }

		/// <summary>
		/// Native Name of the Entry.
		/// </summary>
		/// <remarks>Use localizations to add translations.</remarks>
		[Required, StringLength(200)]
        public String Name { get; set; }

		/// <summary>
		/// Native Description of the Entry.
		/// </summary>
		/// <remarks>Use localizations to add translations.</remarks>
		public String Description { get; set; }


		[MaxLength(100)]
		public String CssClass { get; set; }		

        [MaxLength(100)]
        public String IconCssClass { get; set; }
		
		[MaxLength(100)]
		public String IconUrl { get; set; }


		/// <summary>
		/// Opening hours of events and locations
		/// </summary>
        [StringLength(1000), NonUnicode]
        public String OpeningHours { get; set; }



		//[MaxLength(100), NonUnicode]
		//public String Phone { get; set; }



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

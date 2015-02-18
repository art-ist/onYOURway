namespace onYOURway.Models {
	using System;
	using System.Collections.Generic;
	using System.ComponentModel.DataAnnotations;
	using System.ComponentModel.DataAnnotations.Schema;
	using System.Data.Entity.Spatial;

	/// <summary>
	/// An Entry is an item of interest. Currently this can be a Location or an Event.
	/// </summary>
	[Table("Entries", Schema = "oyw")]
	public partial class Entry {
		public Entry() {
			this.Localizations = new HashSet<EntryLocalization>();
			this.Tags = new HashSet<EntryCategory>();
			this.Links = new HashSet<EntryLink>();
			this.ExternalIds = new HashSet<EntryExternalId>();
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
		/// <see cref="http://wiki.openstreetmap.org/wiki/Key:opening_hours"/>
		/// <see cref="http://openingh.openstreetmap.de/evaluation_tool/"/>
		[StringLength(1000), NonUnicode]
		public String OpeningHours { get; set; }


		public Int64 ThumbId { get; set; }

		public Int64 ImageId { get; set; }

		[MaxLength(20)]
		public String RealmKey { get; set; }

		public Int64 CreatedBy { get; set; }

		[Column(TypeName = "datetime2")]
		public DateTime CreatedAt { get; set; }

		public Int64? ModifiedBy { get; set; }

		[Column(TypeName = "datetime2")]
		public DateTime? ModifiedAt { get; set; }

		public bool ApprovalRequired { get; set; }

		[Column(TypeName = "datetime2")]
		public DateTime ApprovedAt { get; set; }

		public Guid? ApprovedBy { get; set; }

		public bool Published { get; set; }


		#region navigation properties

		public virtual ICollection<EntryCategory> Tags { get; set; }

		public virtual ICollection<EntryExternalId> ExternalIds { get; set; }

		public virtual ICollection<EntryLocalization> Localizations { get; set; }

		public virtual ICollection<EntryLink> Links { get; set; }

		[ForeignKey("RealmKey")]
		public virtual Realm Realm { get; set; }

		[ForeignKey("ThumbId")]
		public virtual Media Thumb { get; set; }

		[ForeignKey("ImageId")]
		public virtual Media Image { get; set; }

		#endregion navigation properties

	} //Entry
} //ns

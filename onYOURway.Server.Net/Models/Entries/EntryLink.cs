namespace onYOURway.Models {
	using System;
	using System.Collections.Generic;
	using System.ComponentModel.DataAnnotations;
	using System.ComponentModel.DataAnnotations.Schema;
	using System.Data.Entity.Spatial;

	/// <summary>
	/// Links to websites, phone numbers email addresses, ...
	/// </summary>
	/// <remarks>Do not replicate with systems enforcing this table to be published e.g. ODbL</remarks>
	[Table("EntryLinks", Schema = "oyw")]
	public partial class EntryLink {
		public EntryLink() {
			this.Type = "Url";
		}

		[Key, Column(Order = 0)]
		public Int64 Id { get; set; }

		[Key, Column(Order = 1), DatabaseGenerated(DatabaseGeneratedOption.None)]
		public Int64 EntryId { get; set; }

		[NonUnicode, MinLength(2), MaxLength(5)]
		public String Locale { get; set; }

		/// <summary>
		/// 
		/// </summary>
		/// <example>Url,Phone,Email</example>
		[Required, MaxLength(5)]
		public String Type { get; set; }

		[Required, MaxLength(30)]
		public String Title { get; set; }

		[Required, MaxLength(1000)]
		public String Url { get; set; }

		/// <summary>
		/// 
		/// </summary>
		/// <value>0 ... do not publish, ues for administrative purpose only</value>
		/// <value>1 ... humans only, try to protect against grabbers, publish in details and via throttled API</value>
		/// <value>2 ... include in bulk results in API, exports and publish to external systems</value>
		public Int16 AccessLevel { get; set; }

		#region navigation properties

		[ForeignKey("EntryId")]
		public virtual Entry Entry { get; set; }

		#endregion navigation properties

	} //class EntryLink
} //ns

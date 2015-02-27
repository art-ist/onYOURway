using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.Spatial;

namespace onYOURway.Models {

	[Table("EntryLocalizations", Schema = "oyw")]
	public partial class EntryLocalization {
		public EntryLocalization() {
			this.Id = new Guid();
		}
	
		/// <summary>
		/// This allows multiple localized Names / Aliases
		/// </summary>
		[Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
		public Guid Id { get; set; }

		public Guid EntryId { get; set; }

		[Required, NonUnicode, MinLength(2), MaxLength(5)]
		public String Locale { get; set; }

		[Required, MaxLength(200)]
		public string Name { get; set; }

		public String Description { get; set; }

		#region navigation properties

		[ForeignKey("EntryId")]
		public virtual Entry Entry { get; set; }

		#endregion navigation properties

	}

}

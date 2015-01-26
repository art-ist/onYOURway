namespace onYOURway.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

	[Table("oyw.EntryLocalizations")]
    public partial class EntryLocalization
    {

        public Int64 EntryId { get; set; }

		[Required]
		[NonUnicode, MinLength(2), MaxLength(5)]
		public String Locale { get; set; }

        [Required]
        [StringLength(200)]
        public string Name { get; set; }

		public String Description { get; set; }

		#region navigation properties

		[ForeignKey("EntryId")]
		public virtual Entry Entry { get; set; }

		#endregion navigation properties

    }
}

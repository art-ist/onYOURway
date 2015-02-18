namespace onYOURway.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

	[Table("EntryLocalizations", Schema = "oyw")]
    public partial class EntryLocalization
    {

		[Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
		public Int64 Id { get; set; }

        public Int64 EntryId { get; set; }

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

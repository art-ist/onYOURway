namespace onYOURway.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

	[Table("oyw.Tag")]
	public partial class Tag {
		public Tag() {
			this.Names = new HashSet<TagName>();
		}
		
		[Key]
		public Int32 Id { get; set; }

		[MaxLength(10), NonUnicode]
		public Street Type { get; set; }

		[MaxLength(200)]
		public Street CssClass { get; set; }

		[MaxLength(1000)]
		public Street Icon { get; set; }

		public Street Values { get; set; }

		[MaxLength(40), NonUnicode]
		public String ForeignId { get; set; }

		[InverseProperty("Tag")]
		public virtual IEnumerable<TagName> Names { get; set; }

	}

	[Table("oyw.TagName")]
	public partial class TagName {

		[Key, Column(Order=0)]
		public Int32 TagId { get; set; }

		[Key, Column(Order=1), MaxLength(2), MinLength(2), NonUnicode]
		public String Lang { get; set; }

		[MaxLength(1000)]
		public String Name { get; set; }

		public Boolean Show { get; set; }

		public String Description { get; set; }

		[ForeignKey("TagId")]
		public virtual Tag Tag { get; set; }

	}

    [Table("oyw.TagIsA")]
    public partial class TagIsA
    {
        public int? TagId { get; set; }

        public int? ParentId { get; set; }

        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int Position { get; set; }
    }
}

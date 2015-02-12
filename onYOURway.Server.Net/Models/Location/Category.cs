using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.Spatial;

namespace onYOURway.Models {

	[Table("Categories", Schema = "oyw")]
	public partial class Category {
		public Category() {
			this.Names = new HashSet<CategoryName>();
			this.Parents = new HashSet<CategoryRelation>();
			this.Children = new HashSet<CategoryRelation>();
		}

		[Key]
		public Int32 Id { get; set; }

		[MaxLength(100)]
		public String CssClass { get; set; }

		[MaxLength(100)]
		public String IconCssClass { get; set; }

		public String Type { get; set; }

		/// <summary>
		/// Indicates if the tag assignment can have a value and what datatype it is. (null = no value)
		/// </summary>
		public String ValueType { get; set; }

		/// <summary>
		/// Optional: Semicolon seperated list of possible values
		/// </summary>
		public String Values { get; set; }

		public Boolean Visible { get; set; }

		[MaxLength(40), NonUnicode]
		public String ForeignId { get; set; }

		#region navigation properties

		[InverseProperty("Category")]
		public virtual IEnumerable<CategoryName> Names { get; set; }

		[InverseProperty("ToCategoryId")]
		public virtual IEnumerable<CategoryRelation> Parents { get; set; }

		[InverseProperty("FromCategoryId")]
		public virtual IEnumerable<CategoryRelation> Children { get; set; }

		#endregion navigation properties

	} //Tag

} //ns

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.Spatial;

namespace onYOURway.Models {

	[Table("CategoryNames", Schema = "oyw")]
	public partial class CategoryName {
		public CategoryName() {
			this.Id = new Guid();
		}

		[Key, DatabaseGenerated(DatabaseGeneratedOption.None)]
		public Guid Id { get; set; }

		[Index("U_oyw_CategoryNames", IsUnique = true, Order = 0)]
		public Guid CategoryId { get; set; }

		[Index("U_oyw_CategoryNames", IsUnique = true, Order = 1), MaxLength(2), MinLength(2), NonUnicode]
		public String Locale { get; set; }

		[Index("U_oyw_CategoryNames", IsUnique = true, Order = 2), MaxLength(1000)]
		public String Name { get; set; }

		/// <summary>
		/// Determines if this name is shown when listing categories in the entry details. It can still be used for searching.
		/// </summary>
		public Boolean Visible { get; set; }

		/// <summary>
		/// Description what this ctegory means or how to qualify.
		/// </summary>
		/// <remarks>While it is quite easy to tell if a venture is a restaurant, it is not that easy for an organic store.</remarks>
		public String Description { get; set; }

		[ForeignKey("CategoryId")]
		public virtual Category Category { get; set; }

	}

}

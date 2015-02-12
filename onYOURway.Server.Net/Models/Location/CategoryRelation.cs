using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.Spatial;

namespace onYOURway.Models {

	[Table("TagRelations", Schema = "oyw")]
	public partial class CategoryRelation {

		[Key, Column(Order=0), DatabaseGenerated(DatabaseGeneratedOption.None)]
		public Int32? FromCategoryId { get; set; }
		
		[Key, Column(Order=2), DatabaseGenerated(DatabaseGeneratedOption.None)]
		public Int32? ToCategoryId { get; set; }

		public Int16? Sort { get; set; }

		#region navigation properties

		[ForeignKey("FromCategoryId")]
		public virtual Category FromCategory { get; set; }

		[ForeignKey("ToCategoryId")]
		public virtual Category ToCategory { get; set; }

		#endregion navigation properties

	} //TagRelation
} //

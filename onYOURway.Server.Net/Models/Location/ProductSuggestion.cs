//namespace onYOURway.Models
//{
//	using System;
//	using System.Collections.Generic;
//	using System.ComponentModel.DataAnnotations;
//	using System.ComponentModel.DataAnnotations.Schema;
//	using System.Data.Entity.Spatial;

//	[Table("ProductSuggestion", Schema = "oyw")]
//	public partial class ProductSuggestion
//	{
//		public long? LocationId { get; set; }

//		[Key]
//		[Column(Order = 0)]
//		[StringLength(100)]
//		public string Item { get; set; }

//		[Key]
//		[Column(Order = 1)]
//		[DatabaseGenerated(DatabaseGeneratedOption.None)]
//		public long UsageCount { get; set; }

//		public virtual Location Location { get; set; }
//	}
//}

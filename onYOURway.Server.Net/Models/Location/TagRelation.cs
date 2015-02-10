using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.Spatial;

namespace onYOURway.Models {

	[Table("TagRelations", Schema = "oyw")]
	public partial class TagRelation {

		[Key, Column(Order=0), DatabaseGenerated(DatabaseGeneratedOption.None)]		
		public Int32? FromTagId { get; set; }

		[Key, Column(Order=2), DatabaseGenerated(DatabaseGeneratedOption.None)]
		public Int32? ToTagId { get; set; }

		public Int16? Sort { get; set; }

		#region navigation properties

		[ForeignKey("FromTagId")]
		public virtual Tag FromTag { get; set; }

		[ForeignKey("ToTagId")]
		public virtual Tag ToTag { get; set; }

		#endregion navigation properties


	} //TagRelation
} //

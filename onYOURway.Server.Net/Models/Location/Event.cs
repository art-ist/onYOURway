namespace onYOURway.Models {
	using System;
	using System.Collections.Generic;
	using System.ComponentModel.DataAnnotations;
	using System.ComponentModel.DataAnnotations.Schema;
	using System.Data.Entity.Spatial;

	public partial class Event : Entry {

		public Int64 LocationId { get; set; }

		#region navigation properties

		[ForeignKey("LocationId")]
		public Location Location { get; set; }

		#endregion navigation properties

	}
}

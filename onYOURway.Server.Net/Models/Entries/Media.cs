namespace onYOURway.Models {
	using System;
	using System.Collections.Generic;
	using System.ComponentModel.DataAnnotations;
	using System.ComponentModel.DataAnnotations.Schema;
	using System.Data.Entity.Spatial;

	public partial class Media  {

		public Int64 Id { get; set; }

		public String MediaType { get; set; }

		public byte[] Bytes { get; set; }

		//public Int64 LocationId { get; set; }

		//#region navigation properties

		//[ForeignKey("LocationId")]
		//public Location Location { get; set; }

		//#endregion navigation properties

	}
}

namespace onYOURway.Models {
	using System;
	using System.Collections.Generic;
	using System.ComponentModel.DataAnnotations;
	using System.ComponentModel.DataAnnotations.Schema;
	using System.Data.Entity.Spatial;

	[Table("Media", Schema = "oyw")]
	public partial class Media {
		public Media() {
			this.Id = new Guid();
		}

		public Guid Id { get; set; }

		public String MediaType { get; set; }

		public byte[] Bytes { get; set; }

		//public Int64 LocationId { get; set; }

		//#region navigation properties

		//[ForeignKey("LocationId")]
		//public Location Location { get; set; }

		//#endregion navigation properties

	}
}

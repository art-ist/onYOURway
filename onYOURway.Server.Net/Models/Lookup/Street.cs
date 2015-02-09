
	using Newtonsoft.Json;
	using System;
	using System.Collections.Generic;
	using System.ComponentModel.DataAnnotations;
	using System.ComponentModel.DataAnnotations.Schema;
	using System.Data.Entity.Spatial;

namespace onYOURway.Models {

	[Table("Streets", Schema="Lookup")]
	public partial class Street {

		[Key, Column(Order = 0), DatabaseGenerated(DatabaseGeneratedOption.None)]
		public Int64 CityId { get; set; }

		[Key, Column(Order = 1), StringLength(200)]
		public String Name { get; set; }

		[JsonConverter(typeof(DbGeographyConverter))]
		public DbGeography Way { get; set; }


		#region navigation properties

		[ForeignKey("CityId")]
		public City City { get; set; }

		#endregion navigation properties

	} //class Street

}

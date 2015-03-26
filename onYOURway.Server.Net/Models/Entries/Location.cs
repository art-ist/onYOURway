namespace onYOURway.Models {
	using Newtonsoft.Json;
	using System;
	using System.Collections.Generic;
	using System.ComponentModel.DataAnnotations;
	using System.ComponentModel.DataAnnotations.Schema;
	using System.Data.Entity.Spatial;

	public partial class Location : Entry {

		#region Address

		[StringLength(2), NonUnicode]
		public String CountryCode { get; set; }

		[StringLength(3), NonUnicode]
		public String ProvinceCode { get; set; }

		//TODO: change to unicode (nvarchar)
		[MaxLength(100)]
		public String City { get; set; }

		[MaxLength(10), NonUnicode]
		public String Zip { get; set; }

		[MaxLength(200)]
		public String Street { get; set; }

		[MaxLength(20)]
		public String HouseNumber { get; set; }

		#endregion Address

		#region Geography

		/// <summary>
		/// Point to show a pin on a map
		/// </summary>
		[JsonConverter(typeof(DbGeographyWktConverter))]
		public DbGeography Position { get; set; }

		/// <summary>
		/// Optional boundary (if the location covers a larger area, e.g. a park.)
		/// </summary>
		[JsonConverter(typeof(DbGeographyWktConverter))]
		public DbGeography Boundary { get; set; }

		#endregion Geography

		#region navigation properties

		public virtual ICollection<Event> Events { get; set; }

		#endregion navigation properties


	} //class Location
} //ns

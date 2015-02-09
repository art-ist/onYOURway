namespace onYOURway.Models {
	using Newtonsoft.Json;
	using System;
	using System.Collections.Generic;
	using System.ComponentModel.DataAnnotations;
	using System.ComponentModel.DataAnnotations.Schema;
	using System.Data.Entity.Spatial;


	[Table("Cities", Schema = "Lookup")]
	public partial class City {
		public City()
			: base() {
			this.Localizations = new HashSet<CityLocalized>();
			this.Streets = new HashSet<Street>();
		}

		[Key, Column(Order = 0), NonUnicode, MinLength(2), MaxLength(2)]
		public string CountryCode { get; set; }

		[Key, Column(Order = 1), MinLength(1), MaxLength(4)]
		public String ProvinceCode { get; set; }

		[NonUnicode, MaxLength(5)]
		public string PhonePrefix { get; set; }

		/// <summary>
		/// Native Country Name
		/// </summary>
		[Key, Column(Order = 2), MaxLength(100)]
		public string Name { get; set; }

		[JsonConverter(typeof(DbGeographyConverter))]
		public DbGeography Boundary { get; set; }

		#region navigation properties

		public virtual ICollection<CityLocalized> Localizations { get; set; }

		[ForeignKey("CountryCode, ProvinceCode")]
		public virtual Province Province { get; set; }

		public virtual IEnumerable<Street> Streets { get; set; }

		#endregion navigation properties

	} //class Country


	[Table("CitiesLocalized", Schema = "Lookup")]
	public partial class CityLocalized {

		public virtual City City { get; set; }
		[Key, NonUnicode, Column(Order = 2), MinLength(2), MaxLength(2), ForeignKey("Country")]
		public string CountryCode { get; set; }

		[Key, Column(Order = 1), MinLength(2), MaxLength(5)]
		public string Locale { get; set; } //TODO: Umbenennen auf Native!???

		[MaxLength(100)]
		public string Name { get; set; }

	} //class CountryLocalized

} //ns

//namespace onYOURway.Models {
//	using Newtonsoft.Json;
//	using System;
//	using System.Collections.Generic;
//	using System.ComponentModel.DataAnnotations;
//	using System.ComponentModel.DataAnnotations.Schema;
//	using System.Data.Entity.Spatial;


//	[Table("Countries", Schema = "Lookup")]
//	public partial class Country {
//		public Country()
//			: base() {
//			this.Localizations = new HashSet<CountryLocalized>();
//			this.Provinces = new HashSet<Province>();
//		}

//		[Key, NonUnicode, MinLength(2), MaxLength(2)]
//		public string CountryCode { get; set; }

//		[NonUnicode, MaxLength(5)]
//		public string PhonePrefix { get; set; }

//		/// <summary>
//		/// Native Country Name
//		/// </summary>
//		[MaxLength(50)]
//		public string Name { get; set; }

//		[JsonConverter(typeof(DbGeographyConverter))]
//		public DbGeography Boundary { get; set; }

//		#region navigation properties

//		public virtual ICollection<Province> Provinces { get; set; }
//		public virtual ICollection<CountryLocalized> Localizations { get; set; }

//		#endregion navigation properties

//	} //class Country


//	[Table("CountriesLocalized", Schema = "Lookup")]
//	public partial class CountryLocalized {

//		public virtual Country Country { get; set; }
//		[Key, NonUnicode, Column(Order = 2), MinLength(2), MaxLength(2), ForeignKey("Country"), Display(Order = 4, Name = "Country code", ShortName = "Code", Description = "The country code according to ISO 3166-1 alpha-2")]
//		public string CountryCode { get; set; }

//		[Key, Column(Order = 1), MinLength(2), MaxLength(5), Display(Order = 5, Name = "Locale", ShortName = "Locale", Description = "The locale for the specified country")]
//		public string Locale { get; set; } //TODO: Umbenennen auf Native!???

//		[MaxLength(50), Display(Order = 6, Name = "Native country name", ShortName = "Native", Description = "The native name of the country")]
//		public string Name { get; set; }

//	} //class CountryLocalized

//} //ns

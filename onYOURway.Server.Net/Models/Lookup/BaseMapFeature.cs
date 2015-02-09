namespace onYOURway.Models {
	using Newtonsoft.Json;
	using System;
	using System.Collections.Generic;
	using System.ComponentModel.DataAnnotations;
	using System.ComponentModel.DataAnnotations.Schema;
	using System.Data.Entity.Spatial;


	[Table("BaseMapFeatures", Schema = "Lookup")]
	public partial class BaseMapFeature {
		public BaseMapFeature()
			: base() {
				this.Localizations = new HashSet<BaseMapFeatureLocalized>();
			this.Children = new HashSet<BaseMapFeature>();
		}

		[Key, DatabaseGenerated(DatabaseGeneratedOption.None)]
		public Int64 Id { get; set; }

		public Int64 ParentId { get; set; }

		public String Type { get; set; }

		[Index, NonUnicode, MinLength(2), MaxLength(4)]
		public string IsoCode { get; set; }

		/// <summary>
		/// Native Name
		/// </summary>
		[Key, Column(Order = 2), MaxLength(100)]
		public string Name { get; set; }

		/// <summary>
		/// 
		/// </summary>
		[JsonConverter(typeof(DbGeographyConverter))]
		public DbGeography Point { get; set; }

		/// <summary>
		/// Bounding box of the 
		/// </summary>
		[JsonConverter(typeof(DbGeographyConverter))]
		public DbGeography BBox { get; set; }

		[JsonConverter(typeof(DbGeographyConverter))]
		public DbGeography Boundary { get; set; }

		#region navigation properties

		public virtual ICollection<BaseMapFeatureLocalized> Localizations { get; set; }

		[ForeignKey("ParentId")]
		public virtual BaseMapFeature Parent { get; set; }

		public virtual IEnumerable<BaseMapFeature> Children { get; set; }

		#endregion navigation properties

	} //class Country


	[Table("BaseMapFeaturesLocalized", Schema = "Lookup")]
	public partial class BaseMapFeatureLocalized {

		[Key, Column(Order = 0), DatabaseGenerated(DatabaseGeneratedOption.None)]
		public Int64 Id { get; set; }

		[Key, Column(Order = 1), MinLength(2), MaxLength(5)]
		public string Locale { get; set; } //TODO: Umbenennen auf Native!???

		[MaxLength(100)]
		public string Name { get; set; }

	} //class CountryLocalized

} //ns

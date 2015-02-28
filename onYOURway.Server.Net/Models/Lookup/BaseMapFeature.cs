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

		/// <summary>
		/// Feature type e.g.: Country, City, Province, Street
		/// </summary>
		[Key, Column(Order = 0), MaxLength(10), Index("IX_Class_Id", 0), Index("IX_Class_IsoCode", 0)]
		public String Class { get; set; }

		[Key, Column(Order = 1), DatabaseGenerated(DatabaseGeneratedOption.None), Index("IX_Class_Id", 1)]
		public Int64 Id { get; set; }

		[MaxLength(10), Index("IX_Parent_Class_Id", 0)]
		public String ParentClass { get; set; }

		[Index("IX_Parent_Class_Id", 1)]
		public Int64? ParentId { get; set; }

		[Index, NonUnicode, MinLength(2), MaxLength(4), Index("IX_Class_IsoCode", 1)]
		public string IsoCode { get; set; }

		/// <summary>
		/// Native Name
		/// </summary>
		[MaxLength(100)]
		public string Name { get; set; }

		/// <summary>
		/// 
		/// </summary>
		[JsonConverter(typeof(DbGeographyConverter))]
		public DbGeography Position { get; set; }

		[JsonConverter(typeof(DbGeographyConverter))]
		public DbGeography Boundary { get; set; }

		/// <summary>
		/// Bounding box of the 
		/// </summary>
		[JsonConverter(typeof(DbGeographyConverter))]
		public DbGeography BoundingBox { get; set; }

		#region navigation properties

		public virtual ICollection<BaseMapFeatureLocalized> Localizations { get; set; }

		[ForeignKey("ParentClass, ParentId")]
		public virtual BaseMapFeature Parent { get; set; }

		public virtual IEnumerable<BaseMapFeature> Children { get; set; }

		#endregion navigation properties

	} //class Country


	[Table("BaseMapFeaturesLocalized", Schema = "Lookup")]
	public partial class BaseMapFeatureLocalized {

		[Key, Column(Order = 0), MaxLength(10)]
		public String FeatureClass { get; set; }

		[Key, Column(Order = 1), DatabaseGenerated(DatabaseGeneratedOption.None)]
		public Int64 FeatureId { get; set; }

		[Key, Column(Order = 2), MinLength(2), MaxLength(5)]
		public string Locale { get; set; } //TODO: Umbenennen auf Native!???

		[MaxLength(100)]
		public string Name { get; set; }

		#region navigation properties

		[ForeignKey("FeatureClass, FeatureId")]
		public virtual BaseMapFeature Feature { get; set; }

		#endregion navigation properties

	} //class CountryLocalized

} //ns

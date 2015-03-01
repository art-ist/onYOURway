using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.Spatial;


namespace onYOURway.Models {

	[Table("Regions", Schema = "oyw")]
	public partial class Region {
		public Region() {
			this.Localizations = new HashSet<RegionLocalized>();
			this.Maps = new HashSet<Map>();
		}

		[Key, MaxLength(40), DatabaseGenerated(DatabaseGeneratedOption.None)]
		public String Key { get; set; }

		[Required, MaxLength(200)]
		public String Name { get; set; }

		/// <summary>
		/// Description in the native language of the region. In case of international activity we suggest using english here.
		/// </summary>
		public String Description { get; set; }

		[MaxLength(1000)]
		public String Website { get; set; }

		[MaxLength(20)]
		public String RealmKey { get; set; }


		public int CreatedBy { get; set; }

		[Column(TypeName = "datetime2")]
		public DateTime CreatedAt { get; set; }

		public Int32? ModifiedBy { get; set; }


		[MaxLength(10)]
		public String BaseMapFeatureClass { get; set; }

		public Int64? BaseMapFeatureId { get; set; }


		[Column(TypeName = "datetime2")]
		public DateTime? ModifiedAt { get; set; }

		[JsonConverter(typeof(DbGeographyConverter))]
		public DbGeography Boundary { get; set; }

		/// <summary>
		/// Bounding box of the 
		/// </summary>
		[JsonConverter(typeof(DbGeographyConverter))]
		public DbGeography BoundingBox { get; set; }


		#region navigation properties

		[ForeignKey("RealmKey")]
		public virtual Realm Realm { get; set; }

		[ForeignKey("BaseMapFeatureClass, BaseMapFeatureId")]
		public virtual BaseMapFeature BaseMapFeature { get; set; }

		public virtual ICollection<Map> Maps { get; set; }

		public virtual ICollection<RegionLocalized> Localizations { get; set; }

		#endregion navigation properties

	} //class Region

	[Table("oyw.RegionsLocalized")]
	public partial class RegionLocalized {

		[Key, MaxLength(40), Column(Order = 0), DatabaseGenerated(DatabaseGeneratedOption.None)]
		public String RegionKey { get; set; }

		[Key, Column(Order = 1), MinLength(2), MaxLength(5)]
		public string Locale { get; set; }

		/// <summary>
		/// Localized name
		/// </summary>
		[Key, Column(Order = 2), MaxLength(200)]
		public String Name { get; set; }

		/// <summary>
		/// Localized description
		/// </summary>
		public String Description { get; set; }

		[MaxLength(1000)]
		public String Website { get; set; }

		#region navigation properties

		[ForeignKey("RegionKey")]
		public virtual Region Region { get; set; }

		#endregion navigation properties

	} //class RegionLocalized

} //ns

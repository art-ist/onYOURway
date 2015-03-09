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

		[Key, Column(Order = 0), MaxLength(20), Index("U_Region_Name", 0, IsUnique=true)]
		public String RealmKey { get; set; }
	
		[Key, Column(Order = 1), MaxLength(40)]
		public String Key { get; set; }

		[Required, MaxLength(200), Index("U_Region_Name", 1, IsUnique=true)]
		public String Name { get; set; }

		/// <summary>
		/// Description in the native language of the region. In case of international activity we suggest using english here.
		/// </summary>
		public String Description { get; set; }

		[MaxLength(1000)]
		public String Website { get; set; }

		/// <summary>
		/// Path to the logo for the Region
		/// </summary>
		/// <remarks>if no logo url is given, the realm-logo should be used, the url should be absolute or relative to the path /Content/{RealmKey} and be 160x160 pixel
		/// </remarks>
		[MaxLength(1000)]
		public String LogoUrl { get; set; }

		public int CreatedBy { get; set; }

		[Column(TypeName = "datetime2")]
		public DateTime CreatedAt { get; set; }

		public Int32? ModifiedBy { get; set; }


		[MaxLength(10)]
		public String BaseMapFeatureClass { get; set; }

		public Int64? BaseMapFeatureId { get; set; }


		[Column(TypeName = "datetime2")]
		public DateTime? ModifiedAt { get; set; }

		/// <summary>
		/// E.g. the borders of a city that acts as a region.
		/// </summary>
		/// <remarks>If </remarks>
		[JsonConverter(typeof(DbGeographyWktConverter))]
		public DbGeography Boundary { get; set; }

		/// <summary>
		/// Bounding box of the Region (can be calculated from Boundary)
		/// </summary>
		[JsonConverter(typeof(DbGeographyWktConverter))]
		public DbGeography BoundingBox { get; set; }

		public Guid? DefaultMapId { get; set; }

		#region navigation properties

		[ForeignKey("RealmKey")]
		public virtual Realm Realm { get; set; }

		[ForeignKey("DefaultMapId")]
		public virtual Map DefaultMap { get; set; }

		/// <summary>
		/// If a region represents a city or district it can be mapped to the according basemap feature. So e.g. the boundaries can be derived from there.
		/// </summary>
		/// <remarks>
		/// This also opens the possibility to have two different 'regions' in the same geographical space 
		/// but being promoted by different realms. E.g. The town of Bayreuth could be a region in the onYOURway realm while 'Bayreuth von morgen' could be a region in the vonMorgen realm.
		/// </remarks>
		[ForeignKey("BaseMapFeatureClass, BaseMapFeatureId")]
		public virtual BaseMapFeature BaseMapFeature { get; set; }

		public virtual ICollection<Map> Maps { get; set; }

		public virtual ICollection<RegionLocalized> Localizations { get; set; }

		#endregion navigation properties

	} //class Region

	[Table("oyw.RegionsLocalized")]
	public partial class RegionLocalized {

		[Key, Column(Order = 0), MaxLength(20), Index("U_RegionLocalized_Name", 0, IsUnique = true)]
		public String RealmKey { get; set; }

		[Key, Column(Order = 1), MaxLength(40)]
		public String RegionKey { get; set; }

		[Key, Column(Order = 2), MinLength(2), MaxLength(5), Index("U_RegionLocalized_Name", 1, IsUnique = true)]
		public string Locale { get; set; }

		/// <summary>
		/// Localized name
		/// </summary>
		[MaxLength(200), Index("U_RegionLocalized_Name", 2, IsUnique = true)]
		public String Name { get; set; }

		/// <summary>
		/// Localized description
		/// </summary>
		public String Description { get; set; }

		[MaxLength(1000)]
		public String Website { get; set; }

		#region navigation properties

		[ForeignKey("RealmKey, RegionKey")]
		public virtual Region Region { get; set; }

		#endregion navigation properties

	} //class RegionLocalized

} //ns

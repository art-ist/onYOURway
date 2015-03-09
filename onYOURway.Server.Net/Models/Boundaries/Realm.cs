using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.Spatial;

namespace onYOURway.Models {

	[Table("Realms", Schema = "oyw")]
	public partial class Realm {
		public Realm() {
			this.Regions = new HashSet<Region>();
			this.Localizations = new HashSet<RealmLocalized>();
		}

		/// <summary>
		/// Unique id
		/// </summary>
		[Key, MaxLength(20)]
		public String Key { get; set; }
		
		/// <summary>
		/// Native name e.g. used as title in realm description
		/// </summary>
		public String Name { get; set; }

		/// <summary>
		/// RegEx pattern to recognize Realm from url
		/// </summary>
		public String UriPattern { get; set; }

		/// <summary>
		/// Comma seperated list of items to return in search suggestions
		/// </summary>
		/// <example>Location</example>
		/// <example>location,tag,city,street</example>
		public String SuggestItems { get; set; }

		/// <summary>
		/// Description in the native language of the realm. In case of international activity we suggest using english here.
		/// </summary>
		public String Description { get; set; }

		/// <summary>
		/// Website of the organization representing the realm
		/// </summary>
		[MaxLength(1000)]
		public String Website { get; set; }

		/// <summary>
		/// Path to the logo for the Realm
		/// </summary>
		/// <remarks>should be absolute or relative to the path /Content/{RealmKey} and be 160x160 pixel
		/// </remarks>
		[MaxLength(1000)]
		public String LogoUrl { get; set; }

		/// <summary>
		/// Root tag of the taxonomy used by this realm thus selecting the available taxonomy
		/// </summary>
		public Guid TaxonomyId { get; set; }

		/// <summary>
		/// Optional geographical focus of the realm. Null means worldwide.
		/// </summary>
		[JsonConverter(typeof(DbGeographyWktConverter))]
		public DbGeography Boundary { get; set; }

		/// <summary>
		/// Bounding box of the realm (can be calculated from Boundary)
		/// </summary>
		[JsonConverter(typeof(DbGeographyWktConverter))]
		public DbGeography BoundingBox { get; set; }

		[MaxLength(40)]
		public String DefaultRegionKey { get; set; }

		#region navigation properties

		/// <summary>
		/// Root category of the taxonomy used by the realm.
		/// </summary>
		[ForeignKey("TaxonomyId")]
		public virtual Category Taxonomy { get; set; }

		/// <summary>
		/// A realm can have an optional default Region. If so a client could show this region by default.
		/// </summary>
		[ForeignKey("Key, DefaultRegionKey")]
		public virtual Region DefaultRegion { get; set; }

		/// <summary>
		/// Translations of the strings to different languages
		/// </summary>
		public virtual ICollection<RealmLocalized> Localizations { get; set; }

		/// <summary>
		/// Regions activley supporting the current realm
		/// </summary>
		public virtual ICollection<Region> Regions { get; set; }
		
		#endregion navigation properties

	}///Realm


	[Table("RealmsLocalized", Schema="oyw")]
	public partial class RealmLocalized {

		/// <summary>
		/// Key of realm to be localized
		/// </summary>
		[Key, Column(Order = 0)]
		public String RealmKey { get; set; }

		/// <summary>
		/// Locale e.g. "de-DE" or language e.g. "de" of localization
		/// </summary>
		[Key, Column(Order = 1), MinLength(2), MaxLength(5)]
		public string Locale { get; set; }

		/// <summary>
		/// Localized name
		/// </summary>
		public String Name { get; set; }

		/// <summary>
		/// Localized description
		/// </summary>
		public String Description { get; set; }

		#region navigation properties

		[ForeignKey("RealmKey")]
		public virtual Realm Realm { get; set; }

		#endregion navigation properties

	} //RealmLocalized

}

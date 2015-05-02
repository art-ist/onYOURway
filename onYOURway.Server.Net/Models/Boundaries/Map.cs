using Newtonsoft.Json; //see: http://stackoverflow.com/questions/18521970/custom-serializer-for-just-one-property-in-json-net
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.Spatial;

namespace onYOURway.Models {

	[Table("Maps", Schema = "oyw")]
	public partial class Map {
		public Map() {
			this.Visible = true;
			this.Localizations = new HashSet<MapLocalized>();
			this.Id = new Guid();
		}

		[Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
		public Guid Id { get; set; }

		[Required, MaxLength(200)]
		public String Name { get; set; }

		public String Description { get; set; }
		
		public Boolean Visible { get; set; }

		public Int16 SortOrder { get; set; }

		[MaxLength(20)]
		public String RealmKey { get; set; }

		[MaxLength(40)]
		public String RegionKey { get; set; }

		/// <summary>
		/// Bounding box of the 
		/// </summary>
		[JsonConverter(typeof(DbGeographyWktConverter))]
		public DbGeography BoundingBox { get; set; }

		#region navigation properties

		[ForeignKey("RealmKey, RegionKey")]
		public virtual Region Region { get; set; }

		public ICollection<MapLocalized> Localizations { get; set; }

		#endregion navigation properties

	} //Maps


	[Table("oyw.MapLocalized")]
	public partial class MapLocalized {

		[Key, Column(Order = 0)]
		public Guid MapId { get; set; }

		/// <summary>
		/// Locale e.g. "de-DE" or language e.g. "de" of localization
		/// </summary>
		[Key, Column(Order = 1), MinLength(2), MaxLength(5)]
		public string Locale { get; set; }

		[Required, MaxLength(200)]
		public String Name { get; set; }

		public String Description { get; set; }

	}

} //ns

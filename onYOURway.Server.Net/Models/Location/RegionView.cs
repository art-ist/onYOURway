using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.Spatial;

namespace onYOURway.Models {

	[Table("oyw.Maps")]
	public partial class Map {
		public Map() {
			this.Visible = true;
			this.Localizations = new HashSet<MapLocalized>();
		}

		[Key, Column(Order = 1), DatabaseGenerated(DatabaseGeneratedOption.None)]
		public Int32 Id { get; set; }

		[Required, MaxLength(200)]
		public String Name { get; set; }

		public String Description { get; set; }
		
		public Boolean Visible { get; set; }

		public Int16 Position { get; set; }

		[Key, Column(Order = 0), DatabaseGenerated(DatabaseGeneratedOption.None)]
		public Int64 RegionId { get; set; }

		public DbGeography Boundary { get; set; }

		#region navigation properties

		public virtual Region Region { get; set; }

		public ICollection<MapLocalized> Localizations { get; set; }

		#endregion navigation properties

	} //Maps


	[Table("oyw.MapLocalized")]
	public partial class MapLocalized {

		[Key, Column(Order = 0)]
		public Int32 MapId { get; set; }

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

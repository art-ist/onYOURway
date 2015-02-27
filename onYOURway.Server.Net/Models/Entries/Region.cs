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
			this.Id = new Guid();
		}

		public Guid Id { get; set; }

		[Required]
		[StringLength(200)]
		public string Name { get; set; }

		[StringLength(1000)]
		public string Website { get; set; }

		public long? OsmRelationId { get; set; }

		public int CreatedBy { get; set; }

		[Column(TypeName = "datetime2")]
		public DateTime CreatedAt { get; set; }

		public int? ModifiedBy { get; set; }

		[Column(TypeName = "datetime2")]
		public DateTime? ModifiedAt { get; set; }

		[JsonConverter(typeof(DbGeographyConverter))]
		public DbGeography Boundary { get; set; }

		#region navigation properties

		public virtual ICollection<RegionLocalized> Localizations { get; set; }

		public virtual ICollection<Map> Maps { get; set; }

		#endregion navigation properties

	}

	[Table("oyw.RegionsLocalized")]
	public partial class RegionLocalized {

		[Key, Column(Order = 0), DatabaseGenerated(DatabaseGeneratedOption.None)]
		public Guid RegionId { get; set; }

		[Key, Column(Order = 1), StringLength(2)]
		public string Lang { get; set; }

		[Key, Column(Order = 2), StringLength(200)]
		public string Name { get; set; }

		[StringLength(1000)]
		public string Website { get; set; }

		#region navigation properties

		public virtual Region Region { get; set; }

		#endregion navigation properties

	}

}

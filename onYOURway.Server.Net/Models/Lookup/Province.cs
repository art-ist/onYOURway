using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.Spatial;

namespace onYOURway.Models {


	[Table("Regions", Schema = "Lookup")]
	public partial class Province {
		public Province() {
			this.Cities = new HashSet<City>();
		}


		[Key, NonUnicode, Column(Order = 1), MinLength(2), MaxLength(2), ForeignKey("Country")]
		public String CountryCode { get; set; }

		[Key, Column(Order = 2), MinLength(1), MaxLength(4)]
		public String ProvinceCode { get; set; }

		[MaxLength(100)]
		public String Name { get; set; }

		#region navigation properties

		[ForeignKey("CountryCode")]
		public virtual Country Country { get; set; }

		public virtual IEnumerable<City> Cities { get; set; }
		
		#endregion navigation properties

	}

}

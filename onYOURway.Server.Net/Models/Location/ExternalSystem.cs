namespace onYOURway.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

	/// <summary>
	/// External system, linked to automatically exchan ge data via API or (automated) ETL process.
	/// </summary>
	[Table("ExternalSystems", Schema = "oyw")]
    public partial class ExternalSystem
    {

        [StringLength(100)]
        public String Id { get; set; }

        [Required, MaxLength(200)]
        public String Name { get; set; }

		/// <summary>
		/// Website of the 
		/// </summary>
		/// <remarks>This is not nessessarily the base Url of the API.</remarks>
        [MaxLength(1000)]
        public String Website { get; set; }

		//TODO: define properties to define witch function schould be run when to exchange data with the foreign system.
		/*
		 * this might include:
		 *	Entries
		 *	Taxonomy
		 *	Mapping of a foreign taxonomy to a native taxonomy
		*/

		[MaxLength(200)]
		public String AppKey { get; set; }

		[MaxLength(200)]
		public String AppSecret { get; set; }

    }
}

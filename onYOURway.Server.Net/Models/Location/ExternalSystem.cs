namespace onYOURway.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

	//external API
    [Table("oyw.ExternalSystems")]
    public partial class ExternalSystem
    {

        [StringLength(100)]
        public String Id { get; set; }

        [Required, MaxLength(200)]
        public String Name { get; set; }

        [MaxLength(1000)]
        public String Website { get; set; }

		[MaxLength(200)]
		public String AppKey { get; set; }

		[MaxLength(200)]
		public String AppSecret { get; set; }

    }
}

namespace onYOURway.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("oyw.Country")]
    public partial class Country
    {
        public int ID { get; set; }

        public long? OBJECTID { get; set; }

        [StringLength(255)]
        public string NAME { get; set; }

        [StringLength(255)]
        public string ISO3 { get; set; }

        [StringLength(255)]
        public string ISO2 { get; set; }

        [StringLength(255)]
        public string FIPS { get; set; }

        [Column("COUNTRY")]
        [StringLength(255)]
        public string COUNTRY1 { get; set; }

        [StringLength(255)]
        public string ENGLISH { get; set; }

        [StringLength(255)]
        public string FRENCH { get; set; }

        [StringLength(255)]
        public string SPANISH { get; set; }

        [StringLength(255)]
        public string LOCAL { get; set; }

        [StringLength(255)]
        public string FAO { get; set; }

        [StringLength(255)]
        public string WAS_ISO { get; set; }

        [StringLength(255)]
        public string SOVEREIGN { get; set; }

        [StringLength(255)]
        public string CONTINENT { get; set; }

        [StringLength(255)]
        public string UNREG1 { get; set; }

        [StringLength(255)]
        public string UNREG2 { get; set; }

        public int? EU { get; set; }

        public float? SQKM { get; set; }

        public DbGeography geom { get; set; }
    }
}

namespace onYOURway.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    public partial class Location : Entry
    {

        [StringLength(2), NonUnicode]
        public string Country { get; set; }

        [StringLength(3), NonUnicode]
        public string Province { get; set; }

		//TODO: change to unicode (nvarchar)
        [StringLength(50), NonUnicode]
        public string City { get; set; }

        [StringLength(10), NonUnicode]
        public string Zip { get; set; }

        [StringLength(200), ]
        public string Street { get; set; }

        [StringLength(20)]
        public string HouseNumber { get; set; }

		[StringLength(100), NonUnicode]
        public string Phone { get; set; }

    }
}

namespace onYOURway.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

	/// <summary>
	/// Localization Messages
	/// </summary>
    [Table("Message", Schema="App")]
    public partial class Message
    {
        [Key]
        [Column(Order = 0)]
        [StringLength(5)]
        public string Locale { get; set; }

        [Key]
        [Column(Order = 1)]
        [StringLength(300)]
        public string Key { get; set; }

        public string Text { get; set; }
    }
}

namespace onYOURway.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("my.ShoppingList")]
    public partial class ShoppingList
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public long UserId { get; set; }

        public long? LocationId { get; set; }

        [Required]
        [StringLength(200)]
        public string Item { get; set; }

        public bool Checked { get; set; }

        public virtual UserProfile UserProfile { get; set; }
    }
}

namespace onYOURway.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("my.UserProfile")]
    public partial class UserProfile
    {
        [Key]
        public long UserId { get; set; }

        [Required]
        [StringLength(56)]
        public string UserName { get; set; }

        [StringLength(50)]
        public string FirstName { get; set; }

        [StringLength(50)]
        public string LastName { get; set; }

        [Required]
        [StringLength(100)]
        public string Email { get; set; }

        public virtual ShoppingList ShoppingList { get; set; }
    }
}

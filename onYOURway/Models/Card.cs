//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace onYOURway.Models
{
    using System;
    using System.Collections.Generic;
    
    public partial class Card
    {
        public long UserId { get; set; }
        public Nullable<long> LocationId { get; set; }
        public Nullable<int> TagId { get; set; }
    
        public virtual UserProfile UserProfile { get; set; }
    }
}

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
    
    public partial class Tag
    {
        public Tag()
        {
            this.Names = new HashSet<TagName>();
            this.Children = new HashSet<Tag>();
            this.Parents = new HashSet<Tag>();
            this.Locations = new HashSet<Location>();
        }
    
        public int Id { get; set; }
        public string Type { get; set; }
    
        public virtual ICollection<TagName> Names { get; set; }
        public virtual ICollection<Tag> Children { get; set; }
        public virtual ICollection<Tag> Parents { get; set; }
        public virtual ICollection<Location> Locations { get; set; }
    }
}

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

	public partial class SearchSuggestion {
		public string Class { get; set; }
		public string Name { get; set; }
	}

    public partial class Place
    {
		//public string T { get; set; }
        public long Id { get; set; }
        public string Name { get; set; }
        public string Alias { get; set; }
        public string Street { get; set; }
        public string HouseNumber { get; set; }
        public string Zip { get; set; }
        public string City { get; set; }
        public string Position { get; set; }
        public string Icon { get; set; }
        public string Tags { get; set; }
        public string Links { get; set; }
        public string Lines { get; set; }
        public string Open { get; set; }
    }

} //ns
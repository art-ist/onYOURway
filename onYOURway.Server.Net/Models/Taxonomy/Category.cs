using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.Spatial;

namespace onYOURway.Models {

	[Table("Categories", Schema = "oyw")]
	public partial class Category {
		public Category() {
			this.Id = new Guid();
			this.Names = new HashSet<CategoryName>();
			this.Parents = new HashSet<CategoryRelation>();
			this.Children = new HashSet<CategoryRelation>();
			this.Visible = true;
		}

		[Key, DatabaseGenerated(DatabaseGeneratedOption.None)]
		public Guid Id { get; set; }

		/// <summary>
		/// Optional unique string-based id wich might be more intuitive to work with than the internally used UUID's
		/// </summary>
		/// <remarks>This key can also be used to corellate to external key/value baed tagging systems like OSM</remarks>
		[MaxLength(100)]
		public String Key { get; set; }

		[MaxLength(100)]
		public String CssClass { get; set; }

		[MaxLength(100)]
		public String IconCssClass { get; set; }

		[MaxLength(200)]
		public String IconUrl { get; set; }

		[MaxLength(20)]
		public String Type { get; set; }

		/// <summary>
		/// Select an editor to add an additional value to the category assignment (possibly a percentage of products for organic stores). 
		/// - null ... no value allowed (the category is assigned or not)
		/// - text, textarea, reichtext
		/// - array of options e.g. ['green', 'blue', 'red']
		/// </summary>
		[MaxLength(100)]
		public String ValueEditor { get; set; }

		/// <summary>
		/// Optional: Semicolon seperated list of possible values for select or option group editors
		/// </summary>
		public String ValueOptions { get; set; }

		/// <summary>
		/// Determines if this category is available for selection in the SiteCollector
		/// </summary>
		public Boolean Visible { get; set; }

		#region navigation properties

		[InverseProperty("Category")]
		public virtual ICollection<CategoryName> Names { get; set; }

		[InverseProperty("ToCategory")]
		public virtual ICollection<CategoryRelation> Parents { get; set; }

		[InverseProperty("FromCategory")]
		public virtual ICollection<CategoryRelation> Children { get; set; }

		#endregion navigation properties

	} //Tag

} //ns

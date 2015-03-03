using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.Spatial;

namespace onYOURway.Models {

	[Table("CategoryRelations", Schema = "oyw")]
	public partial class CategoryRelation {
		public CategoryRelation() {
			this.RelationshipType = "subClassOf";
		}

		[Key, Column(Order = 0), DatabaseGenerated(DatabaseGeneratedOption.None)]
		public Guid FromCategoryId { get; set; }

		[Key, Column(Order = 2), DatabaseGenerated(DatabaseGeneratedOption.None)]
		public Guid ToCategoryId { get; set; }

		/// <summary>
		/// Kind of relationship refering to OWL syntax
		/// </summary>
		/// <value>subClassOf</value>
		/// <value>sameAs</value>
		/// <see cref="http://www.w3.org/TR/2004/REC-owl-features-20040210/#s2.1"/>
		[Required]
		public String RelationshipType { get; set; }

		public Int16? SortOrder { get; set; }

		#region navigation properties

		[ForeignKey("FromCategoryId")]
		public virtual Category FromCategory { get; set; }

		[ForeignKey("ToCategoryId")]
		public virtual Category ToCategory { get; set; }

		#endregion navigation properties

	} //TagRelation
} //

namespace onYOURway.Models {
	using System;
	using System.Data.Entity;
	using System.ComponentModel.DataAnnotations.Schema;
	using System.Linq;
	using System.Data.Entity.Core.Objects;
	using System.Data.Entity.Infrastructure;

	public partial class onYOURwayDbContext : DbContext {
		public onYOURwayDbContext()
			: base("name=onYOURway") {
		}

		#region Functions

		public virtual ObjectResult<SearchSuggestion> SearchSuggestions(Nullable<int> regionId, string lang) {
			var regionIdParameter = regionId.HasValue ?
			new ObjectParameter("regionId", regionId) :
			new ObjectParameter("regionId", typeof(int));
			var langParameter = lang != null ?
			new ObjectParameter("Lang", lang) :
			new ObjectParameter("Lang", typeof(string));
			return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<SearchSuggestion>("SearchSuggestions", regionIdParameter, langParameter);
		}
		public virtual ObjectResult<Place> GetPlaces(Nullable<int> regionId, string lang) {
			var regionIdParameter = regionId.HasValue ?
			new ObjectParameter("RegionId", regionId) :
			new ObjectParameter("RegionId", typeof(int));
			var langParameter = lang != null ?
			new ObjectParameter("Lang", lang) :
			new ObjectParameter("Lang", typeof(string));
			return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<Place>("GetPlaces", regionIdParameter, langParameter);
		}
		public virtual ObjectResult<String> GetTaxonomy(string idSet, string lang) {
			var idSetParameter = idSet != null ?
			new ObjectParameter("idSet", idSet) :
			new ObjectParameter("idSet", typeof(string));
			var langParameter = lang != null ?
			new ObjectParameter("lang", lang) :
			new ObjectParameter("lang", typeof(string));
			return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<string>("GetTaxonomy", idSetParameter, langParameter);
		}

		#endregion Functions

		#region EntitySets

		public virtual DbSet<UserProfile> UserProfiles { get; set; }
		public virtual DbSet<Country> Countries { get; set; }
		public virtual DbSet<HasTag> HasTags { get; set; }
		public virtual DbSet<Location> Locations { get; set; }
		public virtual DbSet<LocationAlias> LocationAliases { get; set; }
		public virtual DbSet<ExternalId> LocationForeignIds { get; set; }
		public virtual DbSet<LocationLink> LocationLinks { get; set; }
		public virtual DbSet<Message> Messages { get; set; }
		public virtual DbSet<Partner> Partners { get; set; }
		public virtual DbSet<Region> Regions { get; set; }
		public virtual DbSet<RegionView> RegionViews { get; set; }
		//public virtual DbSet<ProductSuggestion> ProductSuggestions { get; set; }
		public virtual DbSet<RegionAlias> RegionAlias { get; set; }
		//public virtual DbSet<Street> Streets { get; set; }
		public virtual DbSet<Tag> Tags { get; set; }
		public virtual DbSet<TagName> TagNames { get; set; }
		public virtual DbSet<TagIsA> TagIsAs { get; set; }

		#endregion EntitySets

		/// <summary>
		/// Add additional Db schema definitions, that can't be done through code annotations, using Fliud Api
		/// </summary>
		/// <param name="modelBuilder"></param>
		protected override void OnModelCreating(DbModelBuilder modelBuilder) {
			
		}
	}
}

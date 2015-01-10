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

		public virtual DbSet<ShoppingList> ShoppingLists { get; set; }
		public virtual DbSet<UserProfile> UserProfiles { get; set; }
		public virtual DbSet<Country> Countries { get; set; }
		public virtual DbSet<HasTag> HasTags { get; set; }
		public virtual DbSet<Location> Locations { get; set; }
		public virtual DbSet<LocationAlia> LocationAliases { get; set; }
		public virtual DbSet<LocationForeignId> LocationForeignIds { get; set; }
		public virtual DbSet<LocationLink> LocationLinks { get; set; }
		public virtual DbSet<Message> Messages { get; set; }
		public virtual DbSet<Partner> Partners { get; set; }
		public virtual DbSet<Region> Regions { get; set; }
		public virtual DbSet<RegionView> RegionViews { get; set; }
		public virtual DbSet<ProductSuggestion> ProductSuggestions { get; set; }
		public virtual DbSet<RegionAlia> RegionAlias { get; set; }
		public virtual DbSet<Street> Streets { get; set; }
		public virtual DbSet<Tag> Tags { get; set; }
		public virtual DbSet<TagName> TagNames { get; set; }
		public virtual DbSet<TagIsA> TagIsAs { get; set; }

		#endregion EntitySets

		protected override void OnModelCreating(DbModelBuilder modelBuilder) {
			modelBuilder.Entity<UserProfile>()
				.HasOptional(e => e.ShoppingList)
				.WithRequired(e => e.UserProfile);

			modelBuilder.Entity<Location>()
				.Property(e => e.Lang)
				.IsFixedLength()
				.IsUnicode(false);

			modelBuilder.Entity<Location>()
				.Property(e => e.Country)
				.IsFixedLength()
				.IsUnicode(false);

			modelBuilder.Entity<Location>()
				.Property(e => e.Province)
				.IsFixedLength()
				.IsUnicode(false);

			modelBuilder.Entity<Location>()
				.Property(e => e.City)
				.IsUnicode(false);

			modelBuilder.Entity<Location>()
				.Property(e => e.Zip)
				.IsUnicode(false);

			modelBuilder.Entity<Location>()
				.Property(e => e.Phone)
				.IsUnicode(false);

			modelBuilder.Entity<Location>()
				.Property(e => e.CreatedAt)
				.HasPrecision(2);

			modelBuilder.Entity<Location>()
				.Property(e => e.ModifiedAt)
				.HasPrecision(2);

			modelBuilder.Entity<Location>()
				.Property(e => e.OpeningHours)
				.IsUnicode(false);

			modelBuilder.Entity<Location>()
				.Property(e => e.Type)
				.IsUnicode(false);

			modelBuilder.Entity<Location>()
				.HasMany(e => e.HasTags)
				.WithRequired(e => e.Location)
				.WillCascadeOnDelete(false);

			modelBuilder.Entity<Location>()
				.HasMany(e => e.LocationForeignIds)
				.WithRequired(e => e.Location)
				.WillCascadeOnDelete(false);

			modelBuilder.Entity<Location>()
				.HasMany(e => e.LocationAlias)
				.WithRequired(e => e.Location)
				.WillCascadeOnDelete(false);

			modelBuilder.Entity<Location>()
				.HasMany(e => e.LocationLinks)
				.WithRequired(e => e.Location)
				.WillCascadeOnDelete(false);

			modelBuilder.Entity<LocationAlia>()
				.Property(e => e.Lang)
				.IsFixedLength()
				.IsUnicode(false);

			modelBuilder.Entity<LocationForeignId>()
				.Property(e => e.PartnerId)
				.IsUnicode(false);

			modelBuilder.Entity<LocationForeignId>()
				.Property(e => e.ForeignId)
				.IsUnicode(false);

			modelBuilder.Entity<LocationLink>()
				.Property(e => e.Lang)
				.IsFixedLength()
				.IsUnicode(false);

			modelBuilder.Entity<LocationLink>()
				.Property(e => e.URL)
				.IsUnicode(false);

			modelBuilder.Entity<Message>()
				.Property(e => e.Key)
				.IsUnicode(false);

			modelBuilder.Entity<Partner>()
				.Property(e => e.Id)
				.IsUnicode(false);

			modelBuilder.Entity<Partner>()
				.Property(e => e.Website)
				.IsUnicode(false);

			modelBuilder.Entity<Partner>()
				.HasMany(e => e.LocationForeignIds)
				.WithRequired(e => e.Partner)
				.WillCascadeOnDelete(false);

			modelBuilder.Entity<Region>()
				.Property(e => e.Website)
				.IsUnicode(false);

			modelBuilder.Entity<Region>()
				.Property(e => e.CreatedAt)
				.HasPrecision(2);

			modelBuilder.Entity<Region>()
				.Property(e => e.ModifiedAt)
				.HasPrecision(2);

			modelBuilder.Entity<Region>()
				.HasMany(e => e.Aliases)
				.WithRequired(e => e.Region)
				.WillCascadeOnDelete(false);

			modelBuilder.Entity<Region>()
				.HasMany(e => e.Views)
				.WithRequired(e => e.Region)
				.WillCascadeOnDelete(false);

			modelBuilder.Entity<RegionAlia>()
				.Property(e => e.Lang)
				.IsFixedLength()
				.IsUnicode(false);

			modelBuilder.Entity<RegionAlia>()
				.Property(e => e.Website)
				.IsUnicode(false);
		}
	}
}

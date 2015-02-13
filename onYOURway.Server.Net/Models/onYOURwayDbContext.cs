using System;
using System.Data.Entity;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Data.Entity.Core.Objects;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.ModelConfiguration.Conventions;
using Microsoft.AspNet.Identity.EntityFramework;

namespace onYOURway.Models {

	public partial class onYOURwayDbContext
		: IdentityDbContext<User, Role, Int32, UserExternalLogin, UserRole, UserClaim> /*DbContext*/ {
		public onYOURwayDbContext()
			: base("DefaultConnection") {
		}

		#region customize DB creation

		/// <summary>
		/// Add additional Db schema definitions, that can't be done through code annotations, using Fliud Api
		/// </summary>
		/// <param name="modelBuilder"></param>
		protected override void OnModelCreating(DbModelBuilder modelBuilder) {
			//base.OnModelCreating(modelBuilder);

			//override identity table and schema mappings
			//modelBuilder.Entity<UserRole>().ToTable("UserRoles", "App");
			//modelBuilder.Entity<Role>().ToTable("Roles", "App");
			//modelBuilder.Entity<UserClaim>().ToTable("UserClaims", "App");
			//modelBuilder.Entity<UserExternalLogin>().ToTable("UserExternalLogins", "App");
			//modelBuilder.Entity<User>().ToTable("Users", "App");

			////disable automatic cascade on delete for foreign key creation
			//modelBuilder.Conventions.Remove<OneToManyCascadeDeleteConvention>();
			//modelBuilder.Conventions.Remove<ManyToManyCascadeDeleteConvention>();

			//TODO: make configurable with CategoryRelationAttribute
			modelBuilder.Entity<CategoryRelation>()
				.HasRequired<Category>(r => r.FromCategory)
				.WithMany()
				.WillCascadeOnDelete(false);

		}

		#endregion customize DB creation

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

		#region EntitiySets

		#region App EntitiySets

		public virtual DbSet<Message> Messages { get; set; }
		public virtual DbSet<ExternalSystem> ExternalSystems { get; set; }

		/* Users, Roles inherit from IdentityDbContext */

		#endregion App EntitiySets

		#region Taxonomy EntitySets

		public virtual DbSet<Category> Tags { get; set; }
		public virtual DbSet<CategoryName> TagNames { get; set; }
		public virtual DbSet<CategoryRelation> TagRelations { get; set; }
		public virtual DbSet<EntryCategory> EntryTags { get; set; }

		#endregion Taxonomy EntitySets

		#region Locate EntitiySets


		public virtual DbSet<Realm> Realms { get; set; }
		public virtual DbSet<Region> Regions { get; set; }
		public virtual DbSet<Map> Maps { get; set; }
		//public virtual DbSet<ProductSuggestion> ProductSuggestions { get; set; }
		public virtual DbSet<RegionLocalized> RegionsLocalized { get; set; }


		public virtual DbSet<Entry> Entries { get; set; }
		public virtual DbSet<EntryLocalization> EntryLocalizations { get; set; }
		public virtual DbSet<EntryLink> EntryLinks { get; set; }
		public virtual DbSet<EntryExternalId> EntryExternalIds { get; set; }

		//Entry collections by type
		public virtual DbSet<Location> Locations { get; set; }
		public virtual DbSet<Event> Events { get; set; }


		//public virtual DbSet<Country> Countries { get; set; }
		//public virtual DbSet<Province> Provinces { get; set; }
		//public virtual DbSet<City> Cities { get; set; }
		//public virtual DbSet<Street> Streets { get; set; }		
		public virtual DbSet<BaseMapFeature> BaseMapFeatures { get; set; }

		#endregion Locate EntitiySets

		#region Profile & Security EntitiySets

		//public virtual DbSet<Users> Users { get; set; }

		#endregion Profile & Security EntitiySets

		#endregion EntitySets

		public static onYOURwayDbContext Create() {
			return new onYOURwayDbContext();
		}

	}
}

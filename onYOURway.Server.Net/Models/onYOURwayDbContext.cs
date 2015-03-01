using System;
using System.Data.Entity;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Data.Entity.Core.Objects;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.ModelConfiguration.Conventions;
using Microsoft.AspNet.Identity.EntityFramework;
using System.Text;
using System.Diagnostics;
using System.Data.Entity.Validation;

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

			modelBuilder.Entity<Entry>()
				.HasOptional<Media>(m => m.Thumb)
				.WithMany()
				.WillCascadeOnDelete(false);


			modelBuilder.Entity<Entry>()
				.HasOptional<Media>(m => m.Image)
				.WithMany()
				.WillCascadeOnDelete(false);

		}

		#endregion customize DB creation

		#region Functions

		//public virtual ObjectResult<String> GetTaxonomy(string idSet, string lang) {
		//	var idSetParameter = idSet != null ? new ObjectParameter("idSet", idSet) : new ObjectParameter("idSet", typeof(string));
		//	var langParameter = lang != null ? new ObjectParameter("lang", lang) : new ObjectParameter("lang", typeof(string));
		//	return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<string>("GetTaxonomy", idSetParameter, langParameter);
		//}

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

		#region Entry EntitiySets


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

		public virtual DbSet<Media> Media { get; set; }


		//public virtual DbSet<Country> Countries { get; set; }
		//public virtual DbSet<Province> Provinces { get; set; }
		//public virtual DbSet<City> Cities { get; set; }
		//public virtual DbSet<Street> Streets { get; set; }		
		public virtual DbSet<BaseMapFeature> BaseMapFeatures { get; set; }

		#endregion Entry EntitiySets

		#region Profile & Security EntitiySets

		//public virtual DbSet<Users> Users { get; set; }

		#endregion Profile & Security EntitiySets

		#endregion EntitySets

		#region Helpers

		//Factory
		public static onYOURwayDbContext Create() {
			return new onYOURwayDbContext();
		}

		//Validation
		public void ExtractValidationErrors(DbEntityValidationException ex) {
			foreach (var entity in ex.EntityValidationErrors) {
				foreach (var error in entity.ValidationErrors) {
					Trace.WriteLine(error.ErrorMessage);
				}
			}
		}//ExtractValidationErrors

		//Seed
		public void RunSqlScript(String FilePath, bool RunAsTransaction = true) {
			DbContext db = this;
			((System.Data.SqlClient.SqlConnection)db.Database.Connection).InfoMessage += (delegate(object sender, System.Data.SqlClient.SqlInfoMessageEventArgs e) {
				Trace.WriteLine(e.Message);
			});
			db.Database.CommandTimeout = 120;

			DbContextTransaction tran = null;
			StringBuilder batch = new StringBuilder();
			try {
				using (System.IO.StreamReader rd = new System.IO.StreamReader(FilePath, Encoding.Unicode, true)) {
					Trace.WriteLine("== starting Script " + FilePath);

					if (RunAsTransaction) tran = db.Database.BeginTransaction();
					while (true) {
						string line = rd.ReadLine();
						bool batchComplete = false;
						if (line.Trim().ToLower() == "go" || line.TrimStart().ToLower().StartsWith("go;")) {
							batchComplete = true;
						}
						else if (rd.EndOfStream) {
							batch.AppendLine(line);
							batchComplete = true;
						}
						else {
							batch.AppendLine(line);
						}//if
						if (batchComplete) {
							var sql = batch.ToString();
							if (!string.IsNullOrWhiteSpace(sql)) {
								int rows = db.Database.ExecuteSqlCommand(TransactionalBehavior.DoNotEnsureTransaction, sql);
								Trace.WriteLine(string.Format(rows == -1 ? "Done.\n" : "{0} rows affected.", rows));
							}
							batch.Clear();
						}
						if (rd.EndOfStream) break;
					}//while
					if (tran != null) tran.Commit();

				}//using
			}//try
			catch (System.Data.SqlClient.SqlException ex) {
				if (tran != null) tran.Rollback();
				if (ex.InnerException == null) {
					Trace.WriteLine(string.Format("Running batch:\n{0}", batch));
					Trace.WriteLine("SQL Error: " + ex.Message);
				}
				else {
					Trace.WriteLine("SQL Error: " + ex.Message + "\n" + ex.InnerException.Message);
				}
				throw ex;
			}
			catch (Exception ex) {
				if (ex.InnerException == null) {
					Trace.WriteLine("Error: " + ex.Message);
				}
				else {
					Trace.WriteLine("Error: " + ex.Message + "\n" + ex.InnerException.Message);
				}
				throw ex;
			}
			//finally {
			//	((System.Data.SqlClient.SqlConnection)db.Database.Connection).InfoMessage -= DbInitializer_InfoMessage;
			//}
		}//RunSqlScript

		#endregion Helpers

	} //class
} //ns

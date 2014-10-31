﻿//------------------------------------------------------------------------------
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
    using System.Data.Entity;
    using System.Data.Entity.Infrastructure;
    using System.Data.Entity.Core.Objects;
    using System.Linq;
    
    public partial class onYOURwayEntities : DbContext
    {
        public onYOURwayEntities()
            : base("name=onYOURwayEntities")
        {
            this.Configuration.LazyLoadingEnabled = false;
        }
    
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            throw new UnintentionalCodeFirstException();
        }
    
        public virtual DbSet<Card> Cards { get; set; }
        public virtual DbSet<ShoppingList> ShoppingLists { get; set; }
        public virtual DbSet<UserProfile> UserProfiles { get; set; }
        public virtual DbSet<BikeWay> BikeWays { get; set; }
        public virtual DbSet<LocationForeignId> LocationForeignIds { get; set; }
        public virtual DbSet<Partner> Partners { get; set; }
        public virtual DbSet<ProductSuggestion> ProductSuggestions { get; set; }
        public virtual DbSet<Region> Regions { get; set; }
        public virtual DbSet<RegionAlias> RegionAlias1 { get; set; }
        public virtual DbSet<RegionView> RegionViews { get; set; }
        public virtual DbSet<Tag> Tags { get; set; }
        public virtual DbSet<TagName> TagNames { get; set; }
        public virtual DbSet<TransportLine> TransportLines { get; set; }
        public virtual DbSet<TransportStop> TransportStops { get; set; }
        public virtual DbSet<Membership> Memberships { get; set; }
        public virtual DbSet<OAuthMembership> OAuthMemberships { get; set; }
        public virtual DbSet<Role> Roles { get; set; }
        public virtual DbSet<Location> Locations { get; set; }
        public virtual DbSet<MyLocation> MyLocations { get; set; }
        public virtual DbSet<Street> Streets { get; set; }
        public virtual DbSet<LocationLink> LocationLinks { get; set; }
        public virtual DbSet<LocationAlias> LocationAliases { get; set; }
        public virtual DbSet<Country> Countries { get; set; }
        public virtual DbSet<HasTag> HasTags { get; set; }
    
        public virtual ObjectResult<SearchSuggestion> SearchSuggestions(Nullable<int> regionId, string lang)
        {
            var regionIdParameter = regionId.HasValue ?
                new ObjectParameter("regionId", regionId) :
                new ObjectParameter("regionId", typeof(int));
    
            var langParameter = lang != null ?
                new ObjectParameter("Lang", lang) :
                new ObjectParameter("Lang", typeof(string));
    
            return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<SearchSuggestion>("SearchSuggestions", regionIdParameter, langParameter);
        }
    
        public virtual ObjectResult<Place> GetPlaces(Nullable<int> regionId, string lang)
        {
            var regionIdParameter = regionId.HasValue ?
                new ObjectParameter("RegionId", regionId) :
                new ObjectParameter("RegionId", typeof(int));
    
            var langParameter = lang != null ?
                new ObjectParameter("Lang", lang) :
                new ObjectParameter("Lang", typeof(string));
    
            return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<Place>("GetPlaces", regionIdParameter, langParameter);
        }
    
        public virtual ObjectResult<string> GetTaxonomy(string idSet, string lang)
        {
            var idSetParameter = idSet != null ?
                new ObjectParameter("idSet", idSet) :
                new ObjectParameter("idSet", typeof(string));
    
            var langParameter = lang != null ?
                new ObjectParameter("lang", lang) :
                new ObjectParameter("lang", typeof(string));
    
            return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<string>("GetTaxonomy", idSetParameter, langParameter);
        }
    }
}

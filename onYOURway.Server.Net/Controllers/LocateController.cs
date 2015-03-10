using System;
using System.Linq;
using System.Web.Http;

using Breeze.WebApi2;
using Breeze.ContextProvider.EF6;
using System.Data.SqlClient;
using System.Xml;
using System.Web.Http.Cors;
using Newtonsoft.Json;
using onYOURway.Models;
using System.Collections.Generic;
using System.Data.Entity.SqlServer;
using System.Runtime.InteropServices;
using Newtonsoft.Json.Linq;
using Breeze.ContextProvider;
using System.Web;
using Microsoft.Data.OData;
using System.Web.Http.OData;
using System.Text.RegularExpressions;
using System.Data.Entity.Spatial;

namespace onYOURway.Controllers {

	/// <summary>
	/// Api for mapping data: e.g. regions, locations and the lookup of basemap features like countries, cities, ...
	/// </summary>
	/// <remarks>
	/// Actions on this controller can be called via the routes /Locate or /{Realm}/Locate as configured in App_Start/WebApiConfig.cs.
	/// A Route attribute on a method overrides that setting. 
	/// </remarks>
	[BreezeController, EnableCors("*", "*", "*")]
	public class LocateController : ApiController {

		readonly EFContextProvider<onYOURwayDbContext> db = new onYOURwayContextProvider();

		#region Metadata and App

		/// <summary>
		/// Returns object metadata based on the DB schema required by the Breeze client
		/// </summary>
		/// <returns>Metadata</returns>
		[HttpOptions, AcceptVerbs("GET", "OPTIONS")] //[HttpGet]
		public string Metadata() {
			return db.Metadata();
		}

		/// <summary>
		/// Get Lang based on Request UserLanguages
		/// </summary>
		/// <returns></returns>
		private string GetLang() {
			var langs = HttpContext.Current.Request.UserLanguages;
			if (langs.Count() == 0)
				return "";
			return langs[0].Substring(0, 2);
		}

		/// <summary>
		/// Get Realm based on Request Uri
		/// </summary>
		/// <returns></returns>
		private Realm GetRealm() {
			string uri = this.Request.RequestUri.AbsoluteUri;
			return db.Context
				.Realms
				.SqlQuery("Select * From oyw.Realms r Where @p0 Like r.UriPattern;", uri)
				.FirstOrDefault()
			;
		}

		/// <summary>
		/// Gets all localizable messages for the app in the given language
		/// </summary>
		/// <param name="Locale">language or locale to return the messages in if this parameter is omitted, the first browser language is used</param>
		/// <returns></returns>
		[HttpGet]
		public dynamic Messages(string Locale = null) {
			string locale = Locale ?? GetLang();

			var local = db.Context
				.Messages
				.Where(m => m.Locale == locale)
				;
			var neutral = db.Context
				.Messages
				.Where(m => m.Locale == "")
				;

			IDictionary<string, object> result = new Dictionary<string, object>();
			foreach (Message m in neutral) {
				IDictionary<string, object> tmp = result;
				string[] keys = m.Key.Split('.');
				for (int i = 0; i < keys.Length - 1; i++) {
					if (!tmp.ContainsKey(keys[i])) {
						tmp[keys[i]] = new Dictionary<string, object>();
					}
					tmp = (IDictionary<string, object>)tmp[keys[i]];
				}
				tmp[keys[keys.Length - 1]] = m.Text;
			}
			foreach (Message m in local) {
				IDictionary<string, object> tmp = result;
				string[] keys = m.Key.Split('.');
				for (int i = 0; i < keys.Length - 1; i++) {
					if (!tmp.ContainsKey(keys[i])) {
						tmp[keys[i]] = new Dictionary<string, object>();
					}
					tmp = (IDictionary<string, object>)tmp[keys[i]];
				}
				tmp[keys[keys.Length - 1]] = m.Text;
			}

			return result;
		}

		#endregion Metadata and App

		#region Boundaries

		/// <summary>
		/// A realm (e.g. the the onYOURway-Project, 'Karte von morgen', the Green Map System or the TransforMap project) uses different capabilities of the onYOURway-mapping paltform, may have its own taxonomy and covers locations in different regions. The combination of realm, region and creator define how an entry can be administered.
		/// </summary>
		/// <returns>Queryable Array of Realm</returns>
		[HttpGet, EnableBreezeQuery]
		public IQueryable<Realm> Realms() {
			var result = db.Context
				.Realms
				.Include("Localizations")
			  ;
			return result;
		}

		[HttpGet, Route("Locate/{key}/Realm"), Route("Locate/Realm/{Key}"), EnableBreezeQuery]
		public Realm Realm(string Key) {
			var result = db.Context
				.Realms
				.Include("Localizations")
				.SingleOrDefault(r => r.Key == Key)
			  ;
			return result;
		}

		[HttpGet]
		public string GetRealmKey(string Uri) {
			var realms = db.Context
				.Realms
				.Include("Localizations")
				.ToArray()	//get from db
				.Where(r => Regex.IsMatch(Uri, r.UriPattern, RegexOptions.IgnoreCase))
			;
			var count = realms.Count();
			if (count > 1) {
				throw new HttpException(500, string.Format("More than one ({1}) realms found to match uri {0}.", Uri, count));
			}
			if (count == 1) {
				return realms.First().Key;
			}
			throw new HttpException(404, string.Format("No realm found matching uri {0}.", Uri));
		} //GetRealmKey

		[HttpGet]
		public dynamic GetRealmInfo(string Key, string Locale) {
			var realm = db.Context
				.Realms
				.Include("Regions")
				.Include("DefaultRegion")
				.Where(r => r.Key == Key)
				.Select(r => new { 
					Key = r.Key
					,Name = r.Localizations.Any(l => l.Locale == Locale)
						 ? r.Localizations.FirstOrDefault(l => l.Locale == Locale).Name
						 : r.Name
					,Description = r.Localizations.Any(l => l.Locale == Locale)
						 ? r.Localizations.FirstOrDefault(l => l.Locale == Locale).Description
						 : r.Description
					,Regions = r.Regions.Select (reg => new {
						Key = r.Key
						,Name = r.Localizations.Any(l => l.Locale == Locale)
								? r.Localizations.FirstOrDefault(l => l.Locale == Locale).Name
								: r.Name
						,Description = r.Localizations.Any(l => l.Locale == Locale)
								? r.Localizations.FirstOrDefault(l => l.Locale == Locale).Description
								: r.Description
						,LogoUrl = r.LogoUrl
					})
					,r.DefaultRegionKey
					,BoundingBox = 
						r.BoundingBox //return explicit bbox
						?? (r.DefaultRegion != null //if null -> default region exists?
							? r.DefaultRegion.BoundingBox	//return explicit bbox
								?? (r.DefaultRegion.DefaultMap != null //if null -> default map defined?
									? r.DefaultRegion.DefaultMap.BoundingBox	//default map should have bunding box
									: ( r.DefaultRegion.BaseMapFeature != null ? r.DefaultRegion.BaseMapFeature.BoundingBox : null ) //try to get bbox of basemap feature or give up
									)
							: null //no defaut region return null -> take world
							)
				})
				.Single();
			return realm;
		}

		/// <summary>
		/// Geographical region (country, city) and administrative domain usually maintained by one realm. E.g. "Bayreuth von morgen"
		/// </summary>
		/// <returns>Queryable Array of Region</returns>
		[HttpGet]
		public IQueryable<Region> Regions(string Realm = null) {
			IQueryable<Region> result = db.Context
				.Regions
				.Include("Localizations")
			  ;
			if (Realm != null) {
				result = result.Where(r => r.RealmKey == Realm);
			}
			return result;
		}

		[HttpGet, Route("Locate/{Realm}/Region/{Key}"), Route("Locate/Region/{Key}"), EnableBreezeQuery]
		public Region Region(string Realm, string Key) {
			var result = db.Context
				.Regions
				.Include("Localizations")
				.Include("Maps")
				.SingleOrDefault(r => r.Key == Key)
			  ;
			return result;
		}

		#endregion Boundaries

		#region Entries

		/// <summary>
		/// Returns a list of locations including their related properties
		/// </summary>
		[HttpGet, EnableBreezeQuery]
		public IQueryable<dynamic> Locations() {
			return db.Context
				.Locations
				.Include("Localizations")
				.Include("Categories")
				.Include("Links")
				;
		}

		/// <summary>
		/// Gets all searchable features (Ventures, (Transport)Lines, (Transport)Stops, T)
		/// </summary>
		/// <param name="Realm">Semantic context</param>
		/// <param name="Region">Geograpic context</param>
		/// <param name="Locale"></param>
		/// <returns>Ventures</returns>
		[HttpGet, Route("Locate/{Realm}/{Region}/GetLocationInfos"), Route("Locate/{Realm}/GetLocationInfos")]
		public dynamic GetLocationInfos(string Realm, string Region = "", string Locale = null) {
			if (string.IsNullOrEmpty(Locale)) Locale = GetLang();
			string xml = null;
			using (SqlCommand cd = new SqlCommand()) {
				cd.Connection = (SqlConnection)db.Context.Database.Connection;
				cd.CommandType = System.Data.CommandType.StoredProcedure;
				cd.CommandText = "oyw.GetLocationInfoXml";
				cd.Parameters.AddWithValue("Realm", Region);
				cd.Parameters.AddWithValue("Region", Region);
				cd.Parameters.AddWithValue("Locale", Locale);
				cd.Connection.Open();
				using (XmlReader xr = cd.ExecuteXmlReader()) {
					if (xr != null) {
						System.Text.StringBuilder sb = new System.Text.StringBuilder();
						while (xr.Read()) {
							sb.AppendLine(xr.ReadOuterXml());
						}
						xml = sb.ToString();
					}
				}
			}
			XmlDocument doc = new XmlDocument();
			doc.LoadXml(xml);
			//string json = JsonConvert.SerializeXmlNode(doc);
			//return new System.Web.Mvc.ContentResult { Content = json, ContentType = "application/json" };
			return doc;
		} //Places

		/// <summary>
		/// DEPRICATED
		/// </summary>
		[HttpGet, Route("Locate/{Realm}/Location/{Id}"), Route("Locate/Location/{Id}"), EnableBreezeQuery]
		public dynamic Location(Guid Id) {
			return db.Context
			  .Locations
			  .Include("Localizations")
			  .Include("Categories")
			  .Include("Categories.Category")
			  .Include("Links")
			  .Where(l => l.Id == Id)
			  .FirstOrDefault()
			  ;
		}

		#endregion Entries

		#region Taxonomy

		[HttpGet, EnableQuery]
		public dynamic Categories(Guid? Realm = null, string lang = null) {
			if (string.IsNullOrEmpty(lang)) lang = GetLang();

			var result = db.Context
				.Tags
				.Select(t => new {
					t.Id,
					t.Type,
					Names = t.Names.Where(n => t.Names.Any(_n => _n.Locale == lang) ? n.Locale == lang : string.IsNullOrEmpty(n.Locale)).Select(n => new { n.Name, Lang = n.Locale, Show = n.Visible }),
					//TODO: fix query instead of just exchanging property names
					//Children = t.Parents.Select(p => p.Id),
					//Parents = t.Children.Select(c => c.Id)
				})
				.Where(t => t.Names.Any(n => n.Lang == lang || string.IsNullOrEmpty(n.Lang))) //get all having either a neutral name or one of the current lang
				;
			return result;

		}

		[HttpGet, EnableBreezeQuery]
		public dynamic Taxonomies(string Lang = null) {
			if (string.IsNullOrEmpty(Lang)) Lang = GetLang();
			return db.Context
					.Realms
					.Select(r => r.Taxonomy)
					;
		}

		/// <summary>
		/// Gets the complete taxonomy
		/// </summary>
		[HttpGet, Route("Locate/{Realm}/GetTaxonomy"), Route("Locate/GetTaxonomy/{Id}")]
		public dynamic GetTaxonomy(string Realm = null, Guid? Id = null, string Locale = null) {
			if (string.IsNullOrEmpty(Locale)) Locale = GetLang();
			if (Id == null) Id = db.Context.Realms.SingleOrDefault(r => r.Key == Realm).TaxonomyId;

			string xml = null;
			using (SqlCommand cd = new SqlCommand()) {
				cd.Connection = (SqlConnection)db.Context.Database.Connection;
				cd.CommandType = System.Data.CommandType.Text;
				cd.CommandText = "Select oyw.GetSubCategoriesXml(@parentId, @locale);";
				cd.Parameters.AddWithValue("@parentId", Id);
				cd.Parameters.AddWithValue("@locale", Locale);
				cd.Connection.Open();
				using (XmlReader xr = cd.ExecuteXmlReader()) {
					if (xr != null) {
						System.Text.StringBuilder sb = new System.Text.StringBuilder();
						while (xr.Read()) {
							sb.AppendLine(xr.ReadOuterXml());
						}
						xml = sb.ToString();
					}
				}
			}
			XmlDocument doc = new XmlDocument();
			doc.LoadXml("<x>" + xml + "</x>");
			return doc.GetElementsByTagName("x").Item(0);
		} //GetTaxonomy

		#endregion Taxonomy

		#region Lookups

		/// <summary>
		/// Gets all features of the selected region as search suggestions (typeahead) for the main search box
		/// </summary>
		/// <param name="Region">Key of the current region</param>
		/// <param name="Locale">Language id e.g. "de"</param>
		/// <returns>Search suggestions are only available in realm API</returns>
		[HttpGet, Route("Locate/{Realm}/SearchSuggestions"), Route("Locate/{Realm}/{Region}/SearchSuggestions"), EnableQuery]
		public IEnumerable<SearchSuggestion> SearchSuggestions(string Realm, string Region = "", string Classes = null, string Locale = null) {
			if (string.IsNullOrWhiteSpace(Locale)) Locale = GetLang();
			if (string.IsNullOrWhiteSpace(Classes)) Classes = string.IsNullOrEmpty(Region)
															? "category,location,city"
															: "category,location,street";

			var result = db.Context.Database
				.SqlQuery<SearchSuggestion>("oyw.SearchSuggestions",
					new SqlParameter("Realm", Realm),
					new SqlParameter("Region", Region),
					new SqlParameter("Classes", Classes),
					new SqlParameter("Lang", Locale)
				);
			//ThumbUrl = "http://onyourway.at/api/media/" + l.Id.ToString() + "-300.jpg"
			return result.ToArray();

		} //SearchSuggestions

		[HttpGet, EnableQuery]
		public dynamic GetCountries(string Locale = null) {
			if (string.IsNullOrWhiteSpace(Locale)) Locale = GetLang();

			var result = db.Context
				.BaseMapFeatures
				.Include("Localizations")
				.Where(f => f.Class == "Country")
				.Select(f => new {
					id = f.IsoCode,
					text = f.Localizations.Any(l => l.Locale == Locale)
						 ? f.Localizations.FirstOrDefault(l => l.Locale == Locale).Name
						 : f.Name,
					boundingbox = f.BoundingBox.AsText()
				});
			return result.ToArray();

		} //GetCountries

		[HttpGet, EnableQuery]
		public dynamic GetProvinces(string CountryCode, string Locale = null) {
			if (string.IsNullOrWhiteSpace(Locale)) Locale = GetLang();

			var result = db.Context
				.BaseMapFeatures
				.Include("Localizations")
				.Where(f => f.Class == "Province" && f.Parent.IsoCode == CountryCode)
				.Select(f => new {
					id = f.IsoCode,
					text = f.Localizations.Any(l => l.Locale == Locale)
						 ? f.Localizations.FirstOrDefault(l => l.Locale == Locale).Name
						 : f.Name,
					boundingbox = f.BoundingBox.AsText()
				});
			return result;

		}

		[HttpGet, Route("Locate/GetCities"), Route("Locate/GetCities/{CountryCode}"), Route("Locate/GetCities/{CountryCode}/{ProvinceCode}"), EnableQuery]
		public dynamic GetCities(string CountryCode, string ProvinceCode = null, string Locale = null) {
			if (string.IsNullOrWhiteSpace(Locale)) Locale = GetLang();

			var result = db.Context
				.BaseMapFeatures
				.Include("Localizations")
				.Where(f => f.Class == "City"
							&&
							(
								(f.ParentClass == "Province" && f.Parent.Parent.IsoCode == CountryCode && f.Parent.IsoCode == ProvinceCode)
								||
								(f.ParentClass == "Country" && f.Parent.IsoCode == CountryCode)
							)
				)
				.Select(f => new {
					id = f.Id,
					text = f.Localizations.Any(l => l.Locale == Locale)
						 ? f.Localizations.FirstOrDefault(l => l.Locale == Locale).Name
						 : f.Name,
					boundingbox = f.BoundingBox.AsText()
				});
			return result;

		}

		[HttpGet, Route("Locate/GetStreets"), Route("Locate/GetStreets/{CityId}"), EnableQuery]
		public dynamic GetStreets(Int64 CityId, string Locale = null) {
			if (string.IsNullOrWhiteSpace(Locale)) Locale = GetLang();

			var result = db.Context
				.BaseMapFeatures
				.Include("Localizations")
				.Where(f => f.Class == "Street" && f.Parent.Id == CityId)
				.Select(f => new {
					id = f.Id,
					text = f.Localizations.Any(l => l.Locale == Locale)
						 ? f.Localizations.FirstOrDefault(l => l.Locale == Locale).Name
						 : f.Name,
					boundingbox = f.BoundingBox.AsText()
				});
			return result;

		}

		#endregion Lookups

		#region Updates

		/// <summary>
		/// Send a savebundle of modified entities to update database
		/// </summary>
		/// <param name="Realm"></param>
		/// <param name="saveBundle"></param>
		/// <returns></returns>
		/// <remarks>Saving changes is are only available in realm API. The user must be authentivcated to save changes.</remarks>
		[HttpPost, Authorize, Route("Locate/{Realm}/SaveChanges")]
		public SaveResult SaveChanges(string Realm, JObject saveBundle) {
			return db.SaveChanges(saveBundle);
		}

		#endregion Updates

	} //class

} //ns

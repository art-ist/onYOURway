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

namespace onYOURway.Controllers {

	/// <summary>
	/// Api for mapping data: regions and locations in these regions
	/// </summary>
	[BreezeController, EnableCors("*", "*", "*"), RoutePrefix("api/Locate")]
	public class LocateController : ApiController {

		readonly EFContextProvider<onYOURwayDbContext> db = new EFContextProvider<onYOURwayDbContext>();

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
		/// <param name="lang">language or locale to return the messages in if this parameter is omitted, the first browser language is used</param>
		/// <returns></returns>
		[HttpGet]
		public dynamic Messages(string lang = null) {
			string locale = lang ?? GetLang();

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

		[HttpGet, Route("Realm/{Key}"), EnableBreezeQuery]
		public Realm Realm(string Key) {
			var result = db.Context
				.Realms
				.Include("Localizations")
				.Include("Regions")
				.SingleOrDefault(r => r.Key == Key)
			  ;
			return result;
		}

		/// <summary>
		/// Geographical region (country, city) and administrative domain usually maintained by one realm. E.g. "Bayreuth von morgen"
		/// </summary>
		/// <returns>Queryable Array of Region</returns>
		[HttpGet, Route("Regions"), Route("{Realm}/Regions")]
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

		[HttpGet, Route("Region/{Key}"), EnableBreezeQuery]
		public Region Region(string Key) {
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
		[HttpGet, BreezeQueryable]
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
		/// <param name="Region"></param>
		/// <param name="lang"></param>
		/// <returns>Ventures</returns>
		[HttpGet]
		public dynamic Places(String Region, string lang = null) {
			if (string.IsNullOrEmpty(lang)) lang = GetLang();
			////string xml = db.Context.GetPlaces(Region, lang).First().ToString();
			string xml = null;
			using (SqlCommand cd = new SqlCommand()) {
				cd.Connection = (SqlConnection)db.Context.Database.Connection;
				cd.CommandType = System.Data.CommandType.StoredProcedure;
				cd.CommandText = "oyw.GetPlaces";
				cd.Parameters.AddWithValue("@Region", Region);
				cd.Parameters.AddWithValue("@Lang", lang);
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
		[HttpGet, BreezeQueryable, Route("Location/(Id)")]
		public dynamic Location(Guid Id) {
			return db.Context
			  .Locations
			  .Include("Localizations")
			  .Include("Categories")
			  .Include("Links")
			  .Where(l => l.Id == Id)
			  .FirstOrDefault()
			  ;
		}

		#endregion Entries

		#region Taxonomy

		[HttpGet, Route("{Realm}/Categories"), EnableQuery]
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
		[HttpGet, Route("{Realm}/GetTaxonomy"), Route("GetTaxonomy/{TaxonomyId}")]
		public dynamic GetTaxonomy(string Realm = null, Guid? TaxonomyId = null, string Lang = null) {
			if (string.IsNullOrEmpty(Lang)) Lang = GetLang();
			if (TaxonomyId == null) TaxonomyId = db.Context.Realms.SingleOrDefault(r => r.Key == Realm).TaxonomyId;

			string xml = null;
			using (SqlCommand cd = new SqlCommand()) {
				cd.Connection = (SqlConnection)db.Context.Database.Connection;
				cd.CommandType = System.Data.CommandType.StoredProcedure;
				cd.CommandText = "oyw.GetSubCategoriesXml";
				cd.Parameters.AddWithValue("@parentId", TaxonomyId);
				cd.Parameters.AddWithValue("@lang", Lang);
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
			return doc;
		} //GetTaxonomy

		#endregion Taxonomy

		#region Lookups

		/// <summary>
		/// Gets all features of the selected region as search suggestions (typeahead) for the main search box
		/// </summary>
		/// <param name="Region">Key of the current region</param>
		/// <param name="Locale">Language id e.g. "de"</param>
		/// <returns></returns>
		[HttpGet, Route("{Realm}/SearchSuggestions"), EnableQuery]
		public IEnumerable<SearchSuggestion> SearchSuggestions(string Realm, string Region = "", string Classes = null, string Locale = null) {
			if (string.IsNullOrWhiteSpace(Locale)) Locale = GetLang();
			if (string.IsNullOrWhiteSpace(Classes)) Classes = string.IsNullOrEmpty(Region) 
															? "category,location,city" 
															: "category,location,city,street";

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

		[HttpGet, Route("GetCountries"), EnableQuery]
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

		[HttpGet, Route("GetCities"), Route("GetCities/{CountryCode}"), Route("GetCities/{CountryCode}/{ProvinceCode}"), EnableQuery]
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

		[HttpGet, Route("GetStreets"), Route("GetStreets/{CityId}"), EnableQuery]
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

		// ~api/locate/SaveChanges
		[HttpPost]
		public SaveResult SaveChanges(JObject saveBundle) {
			return db.SaveChanges(saveBundle);
		}

		#endregion Updates

	} //class

} //ns

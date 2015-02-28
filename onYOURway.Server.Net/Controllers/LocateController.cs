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

namespace onYOURway.Controllers {

	/// <summary>
	/// Api for mapping data: regions and locations in these regions
	/// </summary>
	[EnableCors("*", "*", "*")]
	[BreezeController]
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
		[HttpGet]
		public IQueryable<Realm> Realms() {
			var result = db.Context.Realms
				.Include("Localizations")
			  ;
			return result;
		}

		/// <summary>
		/// Geographical region (country, city) and administrative domain usually maintained by one realm. E.g. "Bayreuth von morgen"
		/// </summary>
		/// <returns>Queryable Array of Region</returns>
		[HttpGet]   // api/locate/Regions
		public IQueryable<Region> Regions() {
			var result = db.Context.Regions
				.Include("Maps")
				.Include("Localizations")
				.OrderBy(r => r.Id)
			  ;
			return result;
		}

		#endregion Boundaries


		/// <summary>
		/// Returns a list of locations including their related properties
		/// </summary>
		/// <param name="RegionId"></param>
		/// <param name="lang"></param>
		/// <returns>anonymous locationinfo</returns>
		/// <remarks>OBSOLETE, use Places instead</remarks>
		[HttpGet]   // api/locate/Locations
		public IQueryable<dynamic> Locations() {
			return db.Context.Locations
			  .Include("Categories")
			  .Include("Localizations")
			  ;
		}

		//[HttpOptions]
		//[AcceptVerbs("GET", "OPTIONS")]
		//public dynamic Locations(string RegionId = null, string lang = "de") {
		//  //var boundary = db.Context.Regions.Where(r => r.Id == RegionId).First().Boundary;
		//  return db.Context.Locations; //.Where(s => s.Position.Intersects(boundary))
		//}

		//[HttpGet]
		//public DbGeographyWellKnownValue Buffer(string wkt, int meters) {
		//  return DbGeography.FromText(wkt, 4326).Buffer(meters).WellKnownValue;
		//}

		//[HttpGet]
		//public List<SearchSuggestion> SearchSuggestions(int RegionId, int SurroundingDistance = 2000) {
		//  return db.Context.SearchSuggestions(RegionId, SurroundingDistance).ToList();
		//}

		////[HttpGet]   // api/locate/Streets
		//[HttpOptions]
		//[AcceptVerbs("GET", "OPTIONS")]
		//public IQueryable<dynamic> Streets(string CloseTo = null) {
		//  //var _lang = "de";
		//  return db.Context
		//    .Streets
		//    ;
		//}

		////[HttpGet]
		//[HttpOptions]
		//[AcceptVerbs("GET", "OPTIONS")]
		//public Dictionary<string, object> TransportFeatures(int RegionId) {
		//  var boundary = db.Context.Regions.Where(r => r.Id == RegionId).First().Boundary;
		//  var result = new Dictionary<string, object>();
		//  result.Add("Lines",
		//    db.Context.TransportLines.ToArray() //.Where(l => l.Way.Intersects(boundary)).ToArray()
		//    );
		//  result.Add("Stops",
		//    db.Context.TransportStops.ToArray() //.Where(s => s.Position.Intersects(boundary)).ToArray()
		//  );
		//  return result;
		//}

	
	

		/// <summary>
		/// Gets all features of the selected region as search suggestions (typeahead) for the main search box
		/// </summary>
		/// <param name="regionId">Id of the current region</param>
		/// <param name="lang">Language id e.g. "de"</param>
		/// <returns></returns>
		[HttpGet]
		public dynamic SearchSuggestions(int regionId, string lang = null) {
			if (string.IsNullOrEmpty(lang)) lang = GetLang();

			var query =
				(from l in db.Context.Locations
				 select new {
					 Class = "location",
					 Name = l.Name,
					 Id = l.Id,
					 Subtitle = l.Street + " " + l.HouseNumber + " " + l.City,
					 ThumbnailUrl = "http://onyourway.at/api/media/" + l.Id.ToString() + "-300.jpg"
				 })
				//.Union
				//	(from a in db.Context.Locations
				//	 where a.Locale == null || a.Locale == lang 
				//	 select new {
				//		 Class = "location",
				//		 Name = a.Name,
				//		 Id = a.EntryId,
				//		 Subtitle = a.Location.Street + " " + a.Location.HouseNumber + " " + a.Location.City,
				//		 ThumbnailUrl = "http://onyourway.at/Content/images/ventures/v-" + SqlFunctions.StringConvert((double)a.LocationId).Trim() + "-300.jpg"
				//	 })
				//.Union
				//	(from s in db.Context.Features
				//	 where s.RegionId == regionId
				//	 select new {
				//		 Class = "street",
				//		 Name = s.Name,
				//		 Id = -1L,
				//		 Subtitle = "",
				//		 ThumbnailUrl = ""
				//	 })
			//.Union
			//	(from t in db.Context.TagNames
			//	 where t.Name != null && (t.Lang == null || t.Lang == lang)
			//	 select new {
			//		 Class = "tag",
			//		 Name = t.Name,
			//		 Id = -1L,
			//		 Subtitle = "",
			//		 ThumbnailUrl = ""
			//	 })
			;
			return query.ToArray();
		} //SearchSuggestions

		/// <summary>
		/// Gets all searchable features (Ventures, (Transport)Lines, (Transport)Stops, T)
		/// </summary>
		/// <param name="RegionId"></param>
		/// <param name="lang"></param>
		/// <returns>Ventures</returns>
		[HttpGet]
		public dynamic Places(int RegionId, string lang = null) {
			if (string.IsNullOrEmpty(lang)) lang = GetLang();
			////string xml = db.Context.GetPlaces(RegionId, lang).First().ToString();
			string xml = null;
			using (SqlCommand cd = new SqlCommand()) {
				cd.Connection = (SqlConnection)db.Context.Database.Connection;
				cd.CommandType = System.Data.CommandType.StoredProcedure;
				cd.CommandText = "oyw.GetPlaces";
				cd.Parameters.AddWithValue("@RegionId", RegionId);
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
		public dynamic GetTaxonomy(int RegionId, string lang = null) {
			//switch (RegionId) {
			//	case 1:

			//	default:
			//		break;
			//}
			if (string.IsNullOrEmpty(lang)) lang = GetLang();
			////string xml = db.Context.GetPlaces(RegionId, lang).First().ToString();
			string xml = null;
			using (SqlCommand cd = new SqlCommand()) {
				cd.Connection = (SqlConnection)db.Context.Database.Connection;
				cd.CommandType = System.Data.CommandType.StoredProcedure;
				cd.CommandText = "oyw.GetTaxonomy";
				cd.Parameters.AddWithValue("@idSet", RegionId.ToString());
				cd.Parameters.AddWithValue("@lang", lang);
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

		/// <summary>
		/// DEPRICATED
		/// </summary>
		[HttpGet]
		public dynamic Place(Guid Id) {
			return db.Context
			  .Locations
			  .Include("Aliases")
			  .Include("Tags")
			  .Include("Links")
			  .Where(l => l.Id == Id)
			  .FirstOrDefault()
			  ;
		}


		[HttpGet]
		public dynamic Tags(int? RegionId = 1, string lang = null) {
			if (string.IsNullOrEmpty(lang)) lang = GetLang();
			//TODO: add Region specific Tags or "TagSets"

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
				//get all having either a neutral name or one of the current lang
				.Where(t => t.Names.Any(n => n.Lang == lang || string.IsNullOrEmpty(n.Lang)))
				;
			return result;

		}

		#region Lookups

		[HttpGet, BreezeQueryable]
		public dynamic Countries(string locale = null) {
			if (string.IsNullOrWhiteSpace(locale)) locale = GetLang();

			var result = db.Context
				.BaseMapFeatures
				.Include("Localizations")
				.Where(f => f.Class == "Country")
				.Select(f => new {
					id = f.IsoCode,
					text = f.Localizations.FirstOrDefault(l => l.Locale == locale) != null
						 ? f.Localizations.First(l => l.Locale == locale).Name
						 : f.Name
				});
			return result;

		}

		[HttpGet, BreezeQueryable]
		public dynamic Provinces(string CountryCode, string locale = null) {
			if (string.IsNullOrWhiteSpace(locale)) locale = GetLang();

			var result = db.Context
				.BaseMapFeatures
				.Include("Localizations")
				.Where(f => f.Class == "Province" && f.Parent.IsoCode == CountryCode)
				.Select(f => new {
					id = f.IsoCode,
					text = f.Localizations.FirstOrDefault(l => l.Locale == locale) != null
						 ? f.Localizations.First(l => l.Locale == locale).Name
						 : f.Name
				});
			return result;

		}

		[HttpGet, BreezeQueryable]
		public dynamic Cities(string CountryCode, string ProvinceCode, string locale = null) {
			if (string.IsNullOrWhiteSpace(locale)) locale = GetLang();

			var result = db.Context
				.BaseMapFeatures
				.Include("Localizations")
				.Where(f => f.Class == "City" && f.Parent.Parent.IsoCode == CountryCode && f.Parent.IsoCode == ProvinceCode)
				.Select(f => new {
					id = f.Id,
					text = f.Localizations.FirstOrDefault(l => l.Locale == locale) != null
						 ? f.Localizations.First(l => l.Locale == locale).Name
						 : f.Name
				});
			return result;

		}

		[HttpGet, BreezeQueryable]
		public dynamic Streets(Int64 CityId, string locale = null) {
			if (string.IsNullOrWhiteSpace(locale)) locale = GetLang();

			var result = db.Context
				.BaseMapFeatures
				.Include("Localizations")
				.Where(f => f.Class == "Street" && f.Parent.Id == CityId)
				.Select(f => new {
					id = f.Id,
					text = f.Localizations.FirstOrDefault(l => l.Locale == locale) != null
						 ? f.Localizations.First(l => l.Locale == locale).Name
						 : f.Name
				});
			return result;

		}

		#endregion Lookups

		#region CRUD

		// ~api/locate/SaveChanges
		[HttpPost]
		public SaveResult SaveChanges(JObject saveBundle) {
			return db.SaveChanges(saveBundle);
		}

		#endregion CRUD

	} //class

} //ns

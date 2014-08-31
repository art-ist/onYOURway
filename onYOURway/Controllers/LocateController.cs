using System.Linq;
using System.Web.Http;

using Breeze.WebApi2;
using Breeze.ContextProvider.EF6;
using System.Data.SqlClient;
using System.Xml;
using System.Web.Http.Cors;
using Newtonsoft.Json;
using onYOURway.Models;
using Newtonsoft.Json.Linq;
using Breeze.ContextProvider;

namespace onYOURway.Controllers {

  /// <summary>
  /// Api for mapping data: regions and locations in these regions
  /// </summary>
  [EnableCors("*", "*", "*")]
  [BreezeController]
  public class LocateController : ApiController {

    readonly EFContextProvider<onYOURwayEntities> db = new EFContextProvider<onYOURwayEntities>();

    /// <summary>
    /// Returns object metadata based on the DB schema required by the Breeze client
    /// </summary>
    /// <returns>Metadata</returns>
    [HttpOptions]
    [AcceptVerbs("GET", "OPTIONS")] //[HttpGet]
    public string Metadata() {
      return db.Metadata();
    }

    //[HttpGet]   // api/locate/Regions
    /// <summary>
    /// Get all regions that are onYOURway.
    /// </summary>
    /// <returns>Queryable Array of Region</returns>
    [HttpOptions]
    [AcceptVerbs("GET", "OPTIONS")]
    public IQueryable<Region> Regions() {
      return db.Context.Regions
        .Include("Views")
        .Include("Aliases")
		.OrderBy(r => r.Id)
        ;
    }

    ///// <summary>
    ///// Returns a list of locations including their related properties
    ///// </summary>
    ///// <param name="RegionId"></param>
    ///// <param name="lang"></param>
    ///// <returns>anonymous locationinfo</returns>
    ///// <remarks>OBSOLETE, use Places instead</remarks>
    //[HttpGet]   // api/locate/Locations
    //public IQueryable<dynamic> Locations(int RegionId = 1, string lang = "de") {
    //  return db.Context.Locations
    //    .Include(l => l.Tags)
    //    .Include(l => l.Aliases)
    //    .Include(l => l.Open.Select(o => o.Hours))
    //    .Select(l => new {
    //      Id = l.Id,
    //      Name = l.Name,
    //      Aliases = l.Aliases,
    //      Street = l.Street ?? "", //Street = ((l.Street ?? "") + " " + (l.HouseNumber ?? "")).Trim(),
    //      HouseNumber = l.HouseNumber ?? "",
    //      Zip = l.Zip ?? "",
    //      City = l.City ?? "",
    //      Position = l.Position,
    //      //Group = l.Tags.Where(t => t.Type == "Class").FirstOrDefault().Names.Where(n => n.Lang == lang).FirstOrDefault().Name,
    //      kind = l.Tags.Where(t => t.Type == "Branche").FirstOrDefault().Names.Where(n => n.Lang == lang).FirstOrDefault().Name,
    //      open = l.Open
    //              .Where(o => !o.EndDate.HasValue || o.EndDate >= DateTime.Now)
    //              .Select(o => new {
    //                OpenId = o.OpenId,
    //                StartDate = o.StartDate,
    //                EndDate = o.EndDate,
    //                Hours = o.Hours.Select(h => new {
    //                  TimeBlockId = h.TimeBlockId,
    //                  WeekDay = h.WeekDay,
    //                  StartTime = h.StartTime,
    //                  EndTime = h.EndTime
    //                })
    //              }),
    //      tags = l.Tags
    //              .Join(
    //                db.Context.TagNames.Where(n => n.Lang == lang)
    //                , t => t, n => n.Tag,
    //                (t, n) => new { n.TagId, n.Name }
    //              ),
    //      //Tags = l.Tags
    //      //.Select(t => new {
    //      //  Id = t.Id,
    //      //  Names = t.Names.Where(n => n.Lang == lang).Select(n => n.Name)
    //      //})          
    //      ////obsolete: now calculated on the client (keep code, maybe in the future filter by distance)
    //      //Distance = string.IsNullOrEmpty(CloseTo) ? null : l.Position.Distance(DbGeography.FromText(CloseTo, 4326))
    //    })
    //    //.OrderBy(l => l.Id)
    //    //.OrderBy(l => l.Distance)
    //    ;
    //}

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

    //[HttpGet]
    //public IQueryable<BikeWay> BikeFeatures(int RegionId) {
    //  //var boundary = db.Context.Regions.Where(r => r.Id == RegionId).First().Boundary;
    //  //var result = new Dictionary<string, object>();
    //  //result.Add("BikeWays",
    //  //  db.Context.BikeWays.ToArray() //.Where(l => l.Way.Intersects(boundary)).ToArray()
    //  //  );
    //  //return result.ToArray();
    //  return db.Context.BikeWays;
    //}

    //[HttpGet]
    //public List<Place> GetPlaces(int RegionId, string lang = "de") {
    //  List<Place> result = new List<Place>();
    //  var boundary = db.Context.Regions.Where(r => r.Id == RegionId).First().Boundary;

    //  //Ventures
    //  result.AddRange(
    //    db.Context.Locations
    //    .Include("Tags")
    //    .Include("Tags.Names")
    //    .Include("Aliases")
    //    .Include("Open")
    //    .Include("Open.Hours")
    //    //.Where(l => //intercepts boundary)
    //    .Select(l => new Place() {
    //      PlaceType = PlaceTypes.Venture,
    //      Id = l.Id,
    //      Name = l.Name,
    //      Street = l.Street ?? "", //= ((l.Street ?? "") + " " + (l.HouseNumber ?? "")).Trim(),
    //      HouseNumber = l.HouseNumber ?? "",
    //      Zip = l.Zip ?? "",
    //      City = l.City ?? "",
    //      Position = l.Position,
    //      //Group = l.Tags.Where(t => t.Type == "Class").FirstOrDefault().Names.Where(n => n.Lang == lang).FirstOrDefault().Name,    //Obsolete?
    //      Kind = l.Tags.Where(t => t.Type == "Branche").FirstOrDefault().Names.Where(n => n.Lang == lang).FirstOrDefault().Name,   //Obsolete?
    //      Open = l.Open
    //              .Where(o => !o.EndDate.HasValue || o.EndDate >= DateTime.Now)
    //              .Select(o => new {
    //                //OpenId = o.OpenId,
    //                StartDate = o.StartDate,
    //                EndDate = o.EndDate,
    //                Hours = o.Hours.Select(h => new {
    //                  //TimeBlockId = h.TimeBlockId,
    //                  WeekDay = h.WeekDay,
    //                  StartTime = h.StartTime,
    //                  EndTime = h.EndTime
    //                })
    //              }),
    //      Tags = l.Tags.Select(t => new {
    //        Id = t.Id,
    //        Names = t.Names.Select(n => n.Name),  //.Where(n => n.Lang == null || n.Lang == lang)
    //      }) //Select Tags
    //    }) //Select Place
    //  ); //Ventures

    //  //Streets
    //  result.AddRange(
    //       db.Context.Streets
    //       .Where(s => s.RegionId == RegionId) //intercepts boundary
    //       .Select(s => new Place() {
    //         PlaceType = PlaceTypes.Street,
    //         Name = s.Name
    //       }) //Select Place

    //   ); //Streets

    //  //TransportLines
    //  result.AddRange(
    //    db.Context.TransportLines
    //    //.Where(l => intercepts boundary)
    //       .Select(l => new Place() {
    //         PlaceType = PlaceTypes.TransportLine,
    //         Id = l.Id,
    //         Name = l.Name,
    //         Group = l.Operator,
    //         Kind = l.Mode,
    //         Color = l.Color,
    //         Position = l.Way
    //       }) //Select Place
    // );//TransportLines

    //  //TransportStops
    //  result.AddRange(
    //       db.Context.TransportStops
    //    //.Where(l => intercepts boundary)
    //       .Select(s => new Place() {
    //         PlaceType = PlaceTypes.TransportStop,
    //         Id = s.Id,
    //         Name = s.Name,
    //         Kind = "Haltestelle",
    //         Position = s.Position
    //       }) //Select Place

    //   );//TransportStops

    //  return result;
    //} //GetPlaces

    /// <summary>
    /// Gets all features of the selected region as search suggestions (typeahead) for the main search box
    /// </summary>
    /// <param name="RegionId">Id of the current region</param>
    /// <param name="lang">Language id e.g. "de"</param>
    /// <returns></returns>
    [HttpGet]
    public dynamic SearchSuggestions(int RegionId, string lang = "de") {
      return
        db.Context
          .SearchSuggestions(RegionId, lang)
          .ToArray();
    } //SearchSuggestions

    /// <summary>
    /// Gets all searchable features (Ventures, (Transport)Lines, (Transport)Stops, T)
    /// </summary>
    /// <param name="RegionId"></param>
    /// <param name="lang"></param>
    /// <returns>Ventures</returns>
    [HttpGet]
    public dynamic Places(int RegionId, string lang = "de") {
      ////string xml = db.Context.GetPlaces(RegionId, lang).First().ToString();
      string xml = null;
      using (SqlCommand cd = new SqlCommand()) {
        cd.Connection = (SqlConnection)((Glimpse.Ado.AlternateType.GlimpseDbConnection)db.Context.Database.Connection).InnerConnection;
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
    
    [HttpGet]
	public dynamic Place(double Id) {
      return db.Context
        .Locations
        .Include("Aliases")
        .Include("Tags")
        .Include("Links")
        .Where(l => l.Id == Id)
        .FirstOrDefault()
        ;
    }

    // ~api/locate/SaveChanges
    [HttpPost]
    public SaveResult SaveChanges(JObject saveBundle)
    {
        return db.SaveChanges(saveBundle);
    }

  } //class



} //ns

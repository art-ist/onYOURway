using System;
using System.IO;
using System.Net;
using System.Text;
using System.Web;

namespace ClientPrototypeLeafletJS {
  public partial class JsonProxy : System.Web.UI.Page {
    protected void Page_Load(object sender, EventArgs e) {
      //TODO: Implement Security
      var target = Request.RawUrl;
      string[] urlParts = target.Split(new string[] {"JP.aspx?u="}, StringSplitOptions.RemoveEmptyEntries);
      string host = urlParts[0];
      string remoteUrl = urlParts[1];
      if (urlParts.Length > 1) {
        var remoteRequest = (HttpWebRequest)WebRequest.Create(remoteUrl);
        var remoteResponse = (HttpWebResponse)remoteRequest.GetResponse();
        var remoteContent = new StreamReader(remoteResponse.GetResponseStream()).ReadToEnd();
        Response.ClearHeaders();
        Response.ClearContent();
        Response.Clear();
        Response.Cache.SetCacheability(HttpCacheability.NoCache);
        Response.ContentType = remoteResponse.ContentType; //"application/json";
        Response.AddHeader("Access-Control-Allow-Origin", "http://localhost:42101");
        //Response.ContentEncoding = Encoding.UTF8;
        Response.Write(remoteContent);
        Response.Flush();
      }
      else {
        Response.Status = "Not found";
        Response.StatusCode = (int)HttpStatusCode.NotFound;
        Response.StatusDescription = "Target not found.";
      }
      
    }
  }
}
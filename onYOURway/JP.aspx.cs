using System;
using System.IO;
using System.Net;
using System.Text;
using System.Web;

namespace ClientPrototypeLeafletJS {
  public partial class JsonProxy : System.Web.UI.Page {
    protected void Page_Load(object sender, EventArgs e) {
      //TODO: Implement Security
      var target = Request.QueryString["u"];
      var remoteRequest = (HttpWebRequest)WebRequest.Create(target);
      var remoteResponse = (HttpWebResponse)remoteRequest.GetResponse();
      var json = new StreamReader(remoteResponse.GetResponseStream()).ReadToEnd();

      Response.ClearHeaders();
      Response.ClearContent();
      Response.Clear();
      Response.Cache.SetCacheability(HttpCacheability.NoCache);
      Response.ContentType = "application/json";
      Response.ContentEncoding = Encoding.UTF8;
      Response.Write(json);
      Response.Flush();
    }
  }
}